'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings?tab=subscription');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse">跳转中...</div>
    </div>
  );
}
