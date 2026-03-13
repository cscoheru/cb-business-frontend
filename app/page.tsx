import Link from 'next/link';
import { DailyCardsHero } from '@/components/home/daily-cards-hero';
import { HomeContent } from '@/components/home/home-content';

export default function HomePage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* 全局导航栏 */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                ZenConsult
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <Link href="/cards" className="font-semibold text-blue-600">商机卡片</Link>
                <Link href="/favorites" className="hover:text-gray-900">我的收藏</Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">登录</Link>
              <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 今日商机卡片 - Hero Section */}
      <DailyCardsHero />

      {/* 深度数据探索区域 */}
      <section className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              深度数据探索
            </h2>
            <p className="text-gray-600">
              按地区、主题浏览完整的市场资讯库
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/th" className="group p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <div className="text-4xl mb-3">🌏</div>
              <h3 className="font-semibold text-gray-900 mb-2">东南亚市场</h3>
              <p className="text-sm text-gray-600">泰国、越南、马来西亚...</p>
              <div className="mt-3 text-sm text-blue-600 opacity-0 group-hover:opacity-100">查看 →</div>
            </Link>

            <Link href="/us" className="group p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <div className="text-4xl mb-3">🇺🇸</div>
              <h3 className="font-semibold text-gray-900 mb-2">欧美市场</h3>
              <p className="text-sm text-gray-600">美国、加拿大、欧洲...</p>
              <div className="mt-3 text-sm text-blue-600 opacity-0 group-hover:opacity-100">查看 →</div>
            </Link>

            <Link href="/br" className="group p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all">
              <div className="text-4xl mb-3">🇧🇷</div>
              <h3 className="font-semibold text-gray-900 mb-2">拉美市场</h3>
              <p className="text-sm text-gray-600">巴西、墨西哥、哥伦比亚...</p>
              <div className="mt-3 text-sm text-blue-600 opacity-0 group-hover:opacity-100">查看 →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* 文章流（保持现有功能作为辅助数据源） */}
      <HomeContent />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            想要更深入的数据分析？
          </h2>
          <p className="text-gray-600 mb-4">
            升级到专业版，获取AI选品分析、成本计算器等高级功能
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/pricing" className="px-5 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              查看定价
            </Link>
            <Link href="/register" className="px-5 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
              免费注册
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2024 ZenConsult. 跨境电商智能信息平台</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-gray-900">关于</Link>
              <Link href="#" className="hover:text-gray-900">隐私</Link>
              <Link href="#" className="hover:text-gray-900">条款</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
