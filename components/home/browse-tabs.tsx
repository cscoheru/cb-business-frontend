'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DailyCardsHero } from './daily-cards-hero';
import { RegionBrowseView } from './region-browse-view';

export function BrowseTabs() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <Tabs defaultValue="ranking">
          <TabsList variant="line" className="w-full justify-start border-b">
            <TabsTrigger value="ranking" className="px-6 py-3">
              <span className="mr-1.5">📊</span>
              商机排名
            </TabsTrigger>
            <TabsTrigger value="region" className="px-6 py-3">
              <span className="mr-1.5">🌍</span>
              区域/国家
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ranking" className="mt-0">
            <DailyCardsHero />
          </TabsContent>
          <TabsContent value="region" className="mt-0">
            <RegionBrowseView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
