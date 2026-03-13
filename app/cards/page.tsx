'use client';

import { useEffect, useState } from 'react';
import { CardsGrid } from '@/components/cards/grid';
import { cardsApi, Card } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORY_OPTIONS = [
  { value: '', label: '全部品类' },
  { value: 'wireless_earbuds', label: '无线耳机' },
  { value: 'smart_plugs', label: '智能插座' },
  { value: 'fitness_trackers', label: '健身追踪器' },
];

export default function CardsPage() {
  const [dailyCards, setDailyCards] = useState<Card[]>([]);
  const [latestCards, setLatestCards] = useState<Card[]>([]);
  const [historyCards, setHistoryCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const cardsPerPage = 9;

  useEffect(() => {
    loadDailyCards();
    loadLatestCards();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryCards();
    }
  }, [activeTab, currentPage, selectedCategory]);

  const loadDailyCards = async () => {
    try {
      setLoading(true);
      const response = await cardsApi.getDailyCards();
      setDailyCards(response.cards);
    } catch (error) {
      console.error('Failed to load daily cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestCards = async () => {
    try {
      const response = await cardsApi.getLatestCards(6);
      setLatestCards(response.cards);
    } catch (error) {
      console.error('Failed to load latest cards:', error);
    }
  };

  const loadHistoryCards = async () => {
    try {
      setLoading(true);
      const response = await cardsApi.getCardHistory({
        skip: currentPage * cardsPerPage,
        limit: cardsPerPage,
        category: selectedCategory || undefined,
      });
      setHistoryCards(response.cards);
      setTotalCards(response.total);
    } catch (error) {
      console.error('Failed to load history cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value || '');
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(totalCards / cardsPerPage) - 1;
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const totalPages = Math.ceil(totalCards / cardsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">市场信息卡片</h1>
        <p className="text-muted-foreground">
          访问首页即时生成最新市场分析卡片（30分钟智能缓存），包含价格分析、竞争评估和机会评分
        </p>
      </div>

      {/* 标签页切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="daily">今日卡片</TabsTrigger>
            <TabsTrigger value="latest">最新卡片</TabsTrigger>
            <TabsTrigger value="history">历史卡片</TabsTrigger>
          </TabsList>

          {activeTab === 'history' && (
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="选择品类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="daily" className="mt-6">
          <CardsGrid cards={dailyCards} loading={loading} />
        </TabsContent>

        <TabsContent value="latest" className="mt-6">
          <CardsGrid cards={latestCards} loading={loading} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CardsGrid cards={historyCards} loading={loading} />

          {/* 分页 */}
          {totalCards > 0 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                显示 {currentPage * cardsPerPage + 1} - {Math.min((currentPage + 1) * cardsPerPage, totalCards)} 条，共 {totalCards} 条
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {currentPage + 1} / {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 说明信息 */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">关于信息卡片</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 每次访问即时生成最新市场分析卡片（30分钟智能缓存）</li>
          <li>• 数据来源: Oxylabs Amazon API (95%可靠性)</li>
          <li>• 机会评分综合考虑价格竞争、产品评分、市场饱和度等因素</li>
          <li>• 价格甜蜜点基于畅销产品价格区间分析</li>
        </ul>
      </div>
    </div>
  );
}
