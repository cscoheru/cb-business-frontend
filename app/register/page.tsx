'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

type PlanChoice = 'trial' | 'free';

interface PlanOption {
  id: PlanChoice;
  name: string;
  description: string;
  features: string[];
  recommended: boolean;
  badge: string;
}

const planOptions: PlanOption[] = [
  {
    id: 'trial',
    name: '14天试用版',
    description: '完整体验所有功能',
    features: [
      '✅ 无限查看所有商机',
      '✅ AI智能分析',
      '✅ 数据采集验证',
      '✅ 14天完整体验'
    ],
    recommended: true,
    badge: '推荐'
  },
  {
    id: 'free',
    name: '永久免费版',
    description: '基础功能体验',
    features: [
      '✅ 查看潜在商机',
      '❌ 有限功能访问',
      '❌ 无AI分析',
      '❌ 基础使用'
    ],
    recommended: false,
    badge: ''
  }
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planChoice, setPlanChoice] = useState<PlanChoice>('trial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 如果已登录，重定向到 dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 再次检查是否已登录
    if (user) {
      setError('您已登录，无需注册新账户');
      return;
    }

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name, planChoice);
      // register函数会自动跳转到dashboard
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              创建您的账户
            </h1>
            <p className="text-gray-600">
              选择适合您的计划，开始跨境电商智能之旅
            </p>
          </div>

          {/* Plan Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              选择您的计划
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {planOptions.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setPlanChoice(plan.id)}
                  className={`
                    relative p-6 rounded-lg border-2 cursor-pointer transition-all
                    ${planChoice === plan.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
                >
                  {plan.recommended && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${planChoice === plan.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}
                    `}>
                      {planChoice === plan.id && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="您的姓名"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="至少6位密码"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="再次输入密码"
                  />
                </div>
              </div>

              {/* Selected Plan Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-900">已选择计划</div>
                    <div className="text-lg font-bold text-blue-700">
                      {planOptions.find(p => p.id === planChoice)?.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Cycle to next plan
                      const plans: PlanChoice[] = ['trial', 'free'];
                      const currentIndex = plans.indexOf(planChoice);
                      const nextPlan = plans[(currentIndex + 1) % plans.length];
                      setPlanChoice(nextPlan);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    切换
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-6">
              注册即表示您同意我们的{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                服务条款
              </Link>{' '}
              和{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                隐私政策
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? '注册中...' : `开始${planChoice === 'trial' ? '试用' : '使用'}`}
            </Button>

            <div className="text-center text-sm text-gray-600 mt-4">
              已有账户？{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
                立即登录
              </Link>
            </div>

            {/* Plan Comparison Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/pricing"
                className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
              >
                查看完整计划对比
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>💡 <strong>提示：</strong>试用版用户可完整体验所有功能</p>
          <p className="mt-1">试用期结束后可升级到Pro版或继续使用免费版</p>
        </div>
      </div>
    </div>
  );
}
