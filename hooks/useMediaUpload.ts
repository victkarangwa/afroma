import { useState, useCallback } from 'react';
import { postApi } from '@/http/postApi';
import { MediaUploadRequest, MediaUploadResponse } from '@/types';
import { convertImagesToBase64 } from '@/utils/imageToBase64';

interface UseMediaUploadReturn {
  uploadImages: (imageUris: string[]) => Promise<number[] | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export const useMediaUpload = (): UseMediaUploadReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const uploadImages = useCallback(async (imageUris: string[]): Promise<number[] | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (imageUris.length === 0) {
        return [];
      }

      // Convert images to base64
      const base64Strings = await convertImagesToBase64(imageUris);
    //   console.log('base64Strings', base64Strings.toString());
      // Upload each image
      const uploadPromises = base64Strings.map(async (base64, index) => {
        const requestData: MediaUploadRequest = {
          fileContent: base64,
          mediaType: 'PHOTO',
          featured: index === 0 // First image is featured
        };
        // console.log('requestData', requestData);
        const response = await postApi.uploadMedia(requestData);
        
        if (response && response.data) {
          return response.data.id;
        } else {
          throw new Error(response?.message || 'Failed to upload image');
        }
      });

      const mediaIds = await Promise.all(uploadPromises);
      setSuccess(true);
      return mediaIds;
      
    } catch (err) {
      const errorMessage = 'Error uploading media. Please try again.';
      setError(errorMessage);
      console.error('Error in uploadImages:', err);
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
    uploadImages,
    loading,
    error,
    success,
    reset
  };
}; 