'use client';

import { useEffect, useState } from 'react';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  confidence_score: number;
}

interface FunnelData {
  potential: { count: number };
  verifying: { count: number };
  assessing: { count: number };
  executing: { count: number };
}

export function OpportunityFunnelLoader() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载漏斗数据（带30秒缓存）
        const cachedFunnel = sessionStorage.getItem('sos_funnel_cache');
        const cachedTime = sessionStorage.getItem('sos_funnel_time');
        const now = Date.now();

        if (cachedFunnel && cachedTime && (now - parseInt(cachedTime)) < 30000) {
          const data = JSON.parse(cachedFunnel);
          setFunnel(data.funnel);
        } else {
          const response = await fetch('https://api.zenconsult.top/api/v1/opportunities/funnel');
          const data = await response.json();
          if (data.success && data.funnel) {
            setFunnel(data.funnel);
            sessionStorage.setItem('sos_funnel_cache', JSON.stringify(data));
            sessionStorage.setItem('sos_funnel_time', now.toString());
          }
        }

        // 加载最新商机（带30秒缓存）
        const cachedOpps = sessionStorage.getItem('sos_opps_cache');
        const cachedOppsTime = sessionStorage.getItem('sos_opps_time');

        if (cachedOpps && cachedOppsTime && (now - parseInt(cachedOppsTime)) < 30000) {
          const data = JSON.parse(cachedOpps);
          setOpportunities(data.opportunities || []);
        } else {
          const response = await fetch('https://api.zenconsult.top/api/v1/opportunities?status=potential&limit=3');
          const data = await response.json();
          setOpportunities(data.opportunities || []);
          sessionStorage.setItem('sos_opps_cache', JSON.stringify(data));
          sessionStorage.setItem('sos_opps_time', Date.now().toString());
        }
      } catch (error) {
        console.error('Failed to load opportunity data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      {/* 商机漏斗概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600" id="funnel-potential-count">
            {loading ? '-' : funnel?.potential?.count ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">发现期</div>
          <div className="text-xs text-gray-500">
            {loading ? '加载中' : funnel?.potential?.count ? 'AI分析中' : '待发现'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-yellow-600" id="funnel-verifying-count">
            {loading ? '-' : funnel?.verifying?.count ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">验证期</div>
          <div className="text-xs text-gray-500">
            {loading ? '加载中' : funnel?.verifying?.count ? '数据采集中' : '待验证'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-purple-600" id="funnel-assessing-count">
            {loading ? '-' : funnel?.assessing?.count ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">评估期</div>
          <div className="text-xs text-gray-500">
            {loading ? '加载中' : funnel?.assessing?.count ? '市场分析中' : '待评估'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600" id="funnel-executing-count">
            {loading ? '-' : funnel?.executing?.count ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">执行期</div>
          <div className="text-xs text-gray-500">
            {loading ? '加载中' : funnel?.executing?.count ? '落地跟进中' : '待执行'}
          </div>
        </div>
      </div>

      {/* 最新商机卡片（前3个） */}
      <div id="sos-opportunities-container" className="grid md:grid-cols-3 gap-4">
        {loading ? (
          <>
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
          </>
        ) : opportunities.length > 0 ? (
          opportunities.map((opp) => (
            <a key={opp.id} href={`/opportunities/${opp.id}`} className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  发现期
                </span>
                <span className="text-xs text-gray-500">
                  AI可信度 {Math.round(opp.confidence_score * 100)}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{opp.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{opp.description || '暂无描述'}</p>
            </a>
          ))
        ) : (
          <div className="col-span-3 text-center py-6 text-gray-500 bg-white rounded-lg p-4">
            暂无商机数据，AI正在分析中...
          </div>
        )}
      </div>
    </>
  );
}
