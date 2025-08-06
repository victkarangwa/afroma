import { useState, useCallback } from 'react';
import { postApi } from '@/http/postApi';
import { CreatePostRequest, CreatePostResponse } from '@/types';

interface UseCreatePostReturn {
  createPost: (content: string, mediaFileIds?: number[]) => Promise<CreatePostResponse | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export const useCreatePost = (): UseCreatePostReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createPost = useCallback(async (content: string, mediaFileIds?: number[]): Promise<CreatePostResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const requestData: CreatePostRequest = {
        content,
        mediaFileIds: mediaFileIds || []
      };

      const response = await postApi.createPost(requestData);
      
      if (response && response.success) {
        setSuccess(true);
        return response;
      } else {
        const errorMessage = response?.message || 'Failed to create post';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = 'Error creating post. Please try again.';
      setError(errorMessage);
      console.error('Error in createPost:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    createPost,
    loading,
    error,
    success,
    reset
  };
}; 