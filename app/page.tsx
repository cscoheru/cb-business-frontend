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
                <Link href="/opportunities" className="hover:text-gray-900">智能商机</Link>
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

      {/* SOS智能商机 - 分阶段管理 */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 border-b py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                🎯 AI智能商机跟踪
              </h2>
              <p className="text-gray-600 text-sm">
                实时发现 → 数据验证 → 市场评估 → 执行落地
              </p>
            </div>
            <Link
              href="/opportunities"
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-sm font-medium text-gray-700"
            >
              查看全部
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 商机漏斗概览 */}
          <div id="sos-funnel-container" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600" id="funnel-potential-count">-</div>
              <div className="text-sm text-gray-600 mt-1">发现期</div>
              <div className="text-xs text-gray-500">AI分析中</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-yellow-600" id="funnel-verifying-count">-</div>
              <div className="text-sm text-gray-600 mt-1">验证期</div>
              <div className="text-xs text-gray-500">数据采集中</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600" id="funnel-assessing-count">-</div>
              <div className="text-sm text-gray-600 mt-1">评估期</div>
              <div className="text-xs text-gray-500">市场分析中</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600" id="funnel-executing-count">-</div>
              <div className="text-sm text-gray-600 mt-1">执行期</div>
              <div className="text-xs text-gray-500">落地跟进中</div>
            </div>
          </div>

          {/* 最新商机卡片（前3个） */}
          <div id="sos-opportunities-container" className="grid md:grid-cols-3 gap-4">
            {/* 动态加载 */}
            <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          {/* 加载SOS数据的脚本 */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 加载漏斗数据（带30秒缓存）
                const cachedFunnel = sessionStorage.getItem('sos_funnel_cache');
                const cachedTime = sessionStorage.getItem('sos_funnel_time');
                const now = Date.now();

                if (cachedFunnel && cachedTime && (now - parseInt(cachedTime)) < 30000) {
                  // 使用缓存数据
                  const data = JSON.parse(cachedFunnel);
                  if (data.success && data.funnel) {
                    const f = data.funnel;
                    document.getElementById('funnel-potential-count').textContent = f.potential?.count || 0;
                    document.getElementById('funnel-verifying-count').textContent = f.verifying?.count || 0;
                    document.getElementById('funnel-assessing-count').textContent = f.assessing?.count || 0;
                    document.getElementById('funnel-executing-count').textContent = f.executing?.count || 0;
                  }
                } else {
                  // 从API获取
                  fetch('https://api.zenconsult.top/api/v1/opportunities/funnel')
                    .then(r => r.json())
                    .then(data => {
                      if (data.success && data.funnel) {
                        const f = data.funnel;
                        document.getElementById('funnel-potential-count').textContent = f.potential?.count || 0;
                        document.getElementById('funnel-verifying-count').textContent = f.verifying?.count || 0;
                        document.getElementById('funnel-assessing-count').textContent = f.assessing?.count || 0;
                        document.getElementById('funnel-executing-count').textContent = f.executing?.count || 0;
                        // 缓存30秒
                        sessionStorage.setItem('sos_funnel_cache', JSON.stringify(data));
                        sessionStorage.setItem('sos_funnel_time', now.toString());
                      }
                    });
                }

                // 加载最新商机（带30秒缓存）
                const cachedOpps = sessionStorage.getItem('sos_opps_cache');
                const cachedOppsTime = sessionStorage.getItem('sos_opps_time');

                if (cachedOpps && cachedOppsTime && (now - parseInt(cachedOppsTime)) < 30000) {
                  // 使用缓存数据
                  const data = JSON.parse(cachedOpps);
                  if (data.opportunities && data.opportunities.length > 0) {
                    const container = document.getElementById('sos-opportunities-container');
                    container.innerHTML = data.opportunities.map(opp => \`
                      <a href="/opportunities/\${opp.id}" class="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                        <div class="flex items-center justify-between mb-2">
                          <span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            发现期
                          </span>
                          <span class="text-xs text-gray-500">
                            AI可信度 \${Math.round(opp.confidence_score * 100)}%
                          </span>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">\${opp.title}</h3>
                        <p class="text-sm text-gray-600 line-clamp-2">\${opp.description || '暂无描述'}</p>
                      </a>
                    \`).join('');
                  }
                } else {
                  // 从API获取
                  fetch('https://api.zenconsult.top/api/v1/opportunities?status=potential&limit=3')
                    .then(r => r.json())
                    .then(data => {
                      if (data.opportunities && data.opportunities.length > 0) {
                        const container = document.getElementById('sos-opportunities-container');
                        container.innerHTML = data.opportunities.map(opp => \`
                          <a href="/opportunities/\${opp.id}" class="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div class="flex items-center justify-between mb-2">
                              <span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                发现期
                              </span>
                              <span class="text-xs text-gray-500">
                                AI可信度 \${Math.round(opp.confidence_score * 100)}%
                              </span>
                            </div>
                            <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">\${opp.title}</h3>
                            <p class="text-sm text-gray-600 line-clamp-2">\${opp.description || '暂无描述'}</p>
                          </a>
                        \`).join('');
                        // 缓存30秒
                        sessionStorage.setItem('sos_opps_cache', JSON.stringify(data));
                        sessionStorage.setItem('sos_opps_time', Date.now().toString());
                      } else {
                        document.getElementById('sos-opportunities-container').innerHTML = \`
                          <div class="col-span-3 text-center py-6 text-gray-500">
                            暂无商机数据，AI正在分析中...
                          </div>
                        \`;
                      }
                    });
                }
              })();
            `
          }} />
        </div>
      </section>

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
