import { useState, useEffect, useCallback } from 'react';
import LocalStorage from '@/utils/storage';

interface BookmarkedPost {
  id: number;
  user: {
    firstname: string;
    lastname: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likeCount: number;
  attachments?: Array<{
    id: number;
    mediaUrl: string;
    mediaType: string;
  }>;
  bookmarkedAt: string;
}

interface UseBookmarksReturn {
  bookmarkedPosts: BookmarkedPost[];
  isBookmarked: (postId: number) => boolean;
  toggleBookmark: (post: any) => Promise<void>;
  removeBookmark: (postId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const BOOKMARKS_KEY = 'bookmarked_posts';

export const useBookmarks = (): UseBookmarksReturn => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load bookmarks from storage on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const stored = await LocalStorage.getItem(BOOKMARKS_KEY);
      if (stored && typeof stored === 'string') {
        setBookmarkedPosts(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const saveBookmarks = async (bookmarks: BookmarkedPost[]) => {
    try {
      await LocalStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      setBookmarkedPosts(bookmarks);
    } catch (err) {
      console.error('Error saving bookmarks:', err);
      setError('Failed to save bookmarks');
    }
  };

  const isBookmarked = useCallback((postId: number): boolean => {
    return bookmarkedPosts.some(post => post.id === postId);
  }, [bookmarkedPosts]);

  const toggleBookmark = useCallback(async (post: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const postId = post.id;
      const isCurrentlyBookmarked = isBookmarked(postId);

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const updatedBookmarks = bookmarkedPosts.filter(bookmark => bookmark.id !== postId);
        await saveBookmarks(updatedBookmarks);
      } else {
        // Add bookmark
        const bookmarkedPost: BookmarkedPost = {
          id: post.id,
          user: {
            firstname: post.user.firstname,
            lastname: post.user.lastname,
            avatar: post.user.avatar || post.user.mediaList?.find((media: any) => media.featured)?.thumbnailUrl
          },
          content: post.content,
          createdAt: post.createdAt,
          likeCount: post.likeCount,
          attachments: post.attachments,
          bookmarkedAt: new Date().toISOString()
        };

        const updatedBookmarks = [...bookmarkedPosts, bookmarkedPost];
        await saveBookmarks(updatedBookmarks);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to toggle bookmark');
    } finally {
      setLoading(false);
    }
  }, [bookmarkedPosts, isBookmarked]);

  const removeBookmark = useCallback(async (postId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const updatedBookmarks = bookmarkedPosts.filter(bookmark => bookmark.id !== postId);
      await saveBookmarks(updatedBookmarks);
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark');
    } finally {
      setLoading(false);
    }
  }, [bookmarkedPosts]);

  return {
    bookmarkedPosts,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    loading,
    error
  };
};
