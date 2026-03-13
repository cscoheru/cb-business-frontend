import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin/settings');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground">配置系统参数和功能开关</p>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">通用设置</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>站点名称</Label>
              <p className="text-sm text-muted-foreground">显示在网站标题和页面中</p>
            </div>
            <Input defaultValue="ZenConsult" className="w-64" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>站点描述</Label>
              <p className="text-sm text-muted-foreground">用于SEO和社交媒体分享</p>
            </div>
            <Input defaultValue="跨境电商智能信息平台" className="w-64" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>联系邮箱</Label>
              <p className="text-sm text-muted-foreground">用户联系和支持邮箱</p>
            </div>
            <Input defaultValue="support@zenconsult.top" className="w-64" />
          </div>
        </div>
      </Card>

      {/* Feature Flags */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">功能开关</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <Label>新用户注册</Label>
              <p className="text-sm text-muted-foreground">允许新用户注册账户</p>
            </div>
            <select className="border rounded-lg px-3 py-2">
              <option value="enabled">已启用</option>
              <option value="disabled">已禁用</option>
            </select>
          </div>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <Label>免费试用</Label>
              <p className="text-sm text-muted-foreground">新用户自动获得7天专业版试用</p>
            </div>
            <select className="border rounded-lg px-3 py-2">
              <option value="enabled">已启用</option>
              <option value="disabled">已禁用</option>
            </select>
          </div>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <Label>自动续费</Label>
              <p className="text-sm text-muted-foreground">订阅到期前自动续费</p>
            </div>
            <select className="border rounded-lg px-3 py-2">
              <option value="disabled">已禁用</option>
              <option value="enabled">已启用</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>维护模式</Label>
              <p className="text-sm text-muted-foreground">启用后只有管理员可访问</p>
            </div>
            <select className="border rounded-lg px-3 py-2">
              <option value="disabled">已禁用</option>
              <option value="enabled">已启用</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">支付设置</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Airwallex API Key</Label>
              <Input
                type="password"
                placeholder="sk_live_xxx 或 sk_test_xxx"
                defaultValue="sk_test_********"
              />
            </div>
            <div>
              <Label>Webhook Secret</Label>
              <Input
                type="password"
                placeholder="Webhook 签名密钥"
                defaultValue="********"
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>• 当前状态: <span className="text-yellow-600">审核中</span></p>
            <p>• 审核通过后可获取生产环境密钥</p>
          </div>
        </div>
      </Card>

      {/* Subscription Pricing */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">订阅定价</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">免费版</h3>
            <div className="text-2xl font-bold mb-4">¥0<span className="text-sm font-normal text-muted-foreground">/月</span></div>
            <Input type="number" placeholder="API调用限制/天" defaultValue="5" className="mb-2" />
            <Input type="number" placeholder="卡片数量限制" defaultValue="12" />
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">专业版</h3>
            <div className="text-2xl font-bold mb-4">¥99<span className="text-sm font-normal text-muted-foreground">/月</span></div>
            <Input type="number" placeholder="年付价格" defaultValue="990" className="mb-2" />
            <p className="text-sm text-green-600">节省 ¥198/年</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">企业版</h3>
            <div className="text-2xl font-bold mb-4">¥299<span className="text-sm font-normal text-muted-foreground">/月</span></div>
            <Input type="number" placeholder="年付价格" defaultValue="2990" className="mb-2" />
            <p className="text-sm text-muted-foreground">联系销售</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">重置</Button>
        <Button>保存更改</Button>
      </div>
    </div>
  );
}
