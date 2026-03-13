'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { paymentsApi, APIError } from '@/lib/api';

interface CheckoutParams {
  plan: string;
  cycle: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  // Get plan and cycle from URL params
  const plan = searchParams.get('plan') || 'pro';
  const cycle = searchParams.get('cycle') || 'monthly';

  // Plan details
  const planDetails: Record<string, { name: string; price: number; features: string[] }> = {
    pro: {
      name: '专业版',
      price: cycle === 'yearly' ? 990 : 99,
      features: ['完整市场数据', 'AI机会分析', '风险预警', '无限API调用']
    },
    enterprise: {
      name: '企业版',
      price: cycle === 'yearly' ? 2990 : 299,
      features: ['专业版所有功能', '专属客服', '定制化报告', '团队协作']
    }
  };

  const currentPlan = planDetails[plan] || planDetails.pro;

  // Create payment order on mount
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent('/checkout?plan=' + plan + '&cycle=' + cycle));
      return;
    }

    createPaymentOrder();
  }, [user, plan, cycle]);

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await paymentsApi.createOrder(
        plan as 'pro' | 'enterprise',
        cycle as 'monthly' | 'yearly',
        'airwallex'
      );

      setPaymentData(data);
    } catch (err: any) {
      if (err instanceof APIError) {
        setError(err.getErrorMessage());
      } else {
        setError(err.message || 'Failed to initialize payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    setTimeout(() => {
      router.push('/dashboard/settings?tab=subscription');
    }, 2000);
  };

  const handlePaymentFailed = (errorMessage?: string) => {
    setPaymentStatus('failed');
    setError(errorMessage || 'Payment failed. Please try again.');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">结账</h1>
        <p className="text-muted-foreground">
          完成支付以激活您的 {currentPlan.name} 订阅
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">订单摘要</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{currentPlan.name}</span>
                  <Badge variant="outline">{cycle === 'yearly' ? '年付' : '月付'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {cycle === 'yearly' ? '每年' : '每月'}订阅
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>总计</span>
                  <span>¥{currentPlan.price}</span>
                </div>
                {cycle === 'yearly' && (
                  <p className="text-sm text-green-600 mt-1">
                    节省 ¥{currentPlan.price / 12 * 12 - currentPlan.price}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <p className="font-medium">包含功能:</p>
              {currentPlan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              支付方式
            </h2>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">初始化支付...</span>
              </div>
            )}

            {error && paymentStatus !== 'success' && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">支付错误</span>
                </div>
                <p className="text-sm mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={createPaymentOrder}
                >
                  重试
                </Button>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">支付成功!</span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">
                  正在跳转到订阅管理页面...
                </p>
              </div>
            )}

            {!loading && paymentData && paymentStatus !== 'success' && (
              <AirwallexCheckout
                clientToken={paymentData.client_token}
                paymentIntentId={paymentData.payment_intent_id}
                amount={paymentData.amount}
                onSuccess={handlePaymentSuccess}
                onFailed={handlePaymentFailed}
                setProcessing={setProcessing}
              />
            )}

            {/* Payment Methods Info */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">支持的支付方式:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">信用卡</Badge>
                <Badge variant="secondary">借记卡</Badge>
                <Badge variant="secondary">支付宝</Badge>
                <Badge variant="secondary">微信支付</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                支付由 Airwallex 提供技术支持
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Airwallex Checkout Component
function AirwallexCheckout({
  clientToken,
  paymentIntentId,
  amount,
  onSuccess,
  onFailed,
  setProcessing,
}: {
  clientToken: string;
  paymentIntentId: string;
  amount: number;
  onSuccess: () => void;
  onFailed: (message?: string) => void;
  setProcessing: (processing: boolean) => void;
}) {
  const [airwallexLoaded, setAirwallexLoaded] = useState(false);

  useEffect(() => {
    // Load Airwallex.js
    const script = document.createElement('script');
    script.src = 'https://checkout.airwallex.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setAirwallexLoaded(true);
    script.onerror = () => onFailed('Failed to load payment provider');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!airwallexLoaded || !clientToken) return;

    // Initialize Airwallex checkout
    const initCheckout = async () => {
      try {
        // @ts-ignore - Airwallex global object
        const Airwallex = window.Airwallex;

        if (!Airwallex) {
          throw new Error('Airwallex SDK not loaded');
        }

        // For now, we'll show a placeholder since actual Airwallex implementation
        // requires their merchant account to be fully set up
        setProcessing(false);

      } catch (err: any) {
        onFailed(err.message);
      }
    };

    initCheckout();
  }, [airwallexLoaded, clientToken]);

  const handlePayNow = async () => {
    setProcessing(true);
    // TODO: Implement actual Airwallex checkout flow
    // For now, simulate payment after 2 seconds
    setTimeout(() => {
      setProcessing(false);
      // For development: you can use the mock payment endpoint
      onFailed('Airwallex checkout not yet configured. Please contact support.');
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">支付金额</p>
        <p className="text-2xl font-bold">¥{amount}</p>
      </div>

      {/* Airwallex Drop-in will be mounted here */}
      <div id="airwallex-checkout-element" className="min-h-[200px]" />

      <Button
        className="w-full"
        size="lg"
        onClick={handlePayNow}
        disabled={!airwallexLoaded}
      >
        立即支付 ¥{amount}
      </Button>

      {!airwallexLoaded && (
        <p className="text-sm text-center text-muted-foreground">
          正在加载支付组件...
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
