import { useState, useCallback } from 'react';
import { postApi } from '@/http/postApi';

interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface UseEngagementTrackingReturn {
  trackLike: (postId: number) => Promise<void>;
  trackComment: (postId: number) => Promise<void>;
  trackShare: (postId: number) => Promise<void>;
  trackView: (postId: number) => Promise<void>;
  getEngagementMetrics: (postId: number) => Promise<EngagementMetrics | null>;
  loading: boolean;
  error: string | null;
}

export const useEngagementTracking = (): UseEngagementTrackingReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const trackLike = useCallback(async (postId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Track like engagement
      await postApi.trackEngagement({
        postId,
        engagementType: 'LIKE',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking like:', err);
      setError('Failed to track like engagement');
    } finally {
      setLoading(false);
    }
  }, []);

  const trackComment = useCallback(async (postId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Track comment engagement
      await postApi.trackEngagement({
        postId,
        engagementType: 'COMMENT',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking comment:', err);
      setError('Failed to track comment engagement');
    } finally {
      setLoading(false);
    }
  }, []);

  const trackShare = useCallback(async (postId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Track share engagement
      await postApi.trackEngagement({
        postId,
        engagementType: 'SHARE',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking share:', err);
      setError('Failed to track share engagement');
    } finally {
      setLoading(false);
    }
  }, []);

  const trackView = useCallback(async (postId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Track view engagement
      await postApi.trackEngagement({
        postId,
        engagementType: 'VIEW',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking view:', err);
      setError('Failed to track view engagement');
    } finally {
      setLoading(false);
    }
  }, []);

  const getEngagementMetrics = useCallback(async (postId: number): Promise<EngagementMetrics | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postApi.getEngagementMetrics(postId);
      return response?.data || null;
    } catch (err) {
      console.error('Error getting engagement metrics:', err);
      setError('Failed to get engagement metrics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trackLike,
    trackComment,
    trackShare,
    trackView,
    getEngagementMetrics,
    loading,
    error
  };
};
