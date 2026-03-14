'use client';

import { useEffect, useState } from 'react';

interface OpportunityStatus {
  id: string;
  status: string;
  label: string;
  confidence_score: number;
}

/**
 * Hook to fetch and poll opportunity status
 * @param opportunityId - The opportunity ID to monitor
 * @param pollInterval - Polling interval in milliseconds (default: 30000 = 30s)
 */
export function useOpportunityStatus(
  opportunityId: string | null,
  pollInterval: number = 30000
) {
  const [status, setStatus] = useState<OpportunityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const STATUS_LABELS: Record<string, string> = {
    'potential': 'AI分析中',
    'verifying': '验证中',
    'assessing': '评估中',
    'executing': '执行中',
    'archived': '已归档',
  };

  useEffect(() => {
    if (!opportunityId) return;

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://api.zenconsult.top/api/v1/opportunities/${opportunityId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch opportunity status');
        }

        const data = await response.json();
        const opportunity = data.opportunity;

        setStatus({
          id: opportunity.id,
          status: opportunity.status,
          label: STATUS_LABELS[opportunity.status] || opportunity.status,
          confidence_score: opportunity.confidence_score,
        });

        setError(null);
      } catch (err) {
        console.error('Failed to fetch opportunity status:', err);
        setError(err instanceof Error ? err.message : '获取状态失败');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling
    const intervalId = setInterval(fetchStatus, pollInterval);

    return () => clearInterval(intervalId);
  }, [opportunityId, pollInterval]);

  return { status, isLoading, error };
}
