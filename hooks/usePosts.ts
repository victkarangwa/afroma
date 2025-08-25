import { useState, useEffect, useCallback } from 'react';
import { postApi } from '@/http/postApi';
import { Post, PostListRequest, PostListResponse } from '@/types';

interface UsePostsOptions {
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
  profileType?: string;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  loadPosts: (page?: number, search?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  searchPosts: (searchTerm: string) => Promise<void>;
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
  const {
    initialPage = 1,
    pageSize = 20,
    autoLoad = true,
    profileType
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadPosts = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await postApi.getPosts(page, pageSize, search, profileType);
      
      if (response && response.success) {
        if (page === 1) {
          // First page - replace posts
          setPosts(response.list);
        } else {
          // Subsequent pages - append posts
          setPosts(prev => [...prev, ...response.list]);
        }
        
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setTotalRecords(response.totalRecords);
        setHasMore(response.currentPage < response.totalPages);
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('Error loading posts. Please try again.');
      console.error('Error in loadPosts:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, profileType]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadPosts(currentPage + 1);
    }
  }, [loading, hasMore, currentPage, loadPosts]);

  const refresh = useCallback(async () => {
    setPosts([]);
    setCurrentPage(1);
    setHasMore(true);
    await loadPosts(1);
  }, [loadPosts]);

  const searchPosts = useCallback(async (searchTerm: string) => {
    setPosts([]);
    setCurrentPage(1);
    setHasMore(true);
    await loadPosts(1, searchTerm);
  }, [loadPosts]);

  // Update posts when profileType changes
  useEffect(() => {
    if (autoLoad) {
      setPosts([]);
      setCurrentPage(1);
      setHasMore(true);
      loadPosts(1);
    }
  }, [profileType, autoLoad, loadPosts]);

  // Auto-load posts on mount
  useEffect(() => {
    if (autoLoad) {
      loadPosts(1);
    }
  }, [autoLoad, loadPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    currentPage,
    totalPages,
    totalRecords,
    loadPosts,
    loadMore,
    refresh,
    searchPosts
  };
}; 