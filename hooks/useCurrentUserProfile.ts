import { useState, useCallback, useEffect } from 'react';
import useApiRequest from './useApiRequest';
import { ApiResponse } from '@/types';

interface GalleryItem {
  id: number;
  thumbnailUrl: string;
  mediaUrl: string;
  fileName: string;
  featured: boolean;
  mediaType: string;
}

interface Answer {
  id: number;
  text: string;
}

interface ProfileAnswer {
  id: number;
  question: string;
  answers: Answer[];
}

interface CurrentUserProfile {
  id: number;
  firstname: string;
  lastname: string;
  gender: string;
  interestedIn: string;
  bio?: string;
  dateOfBirth: string;
  gallery?: GalleryItem[];
  publicFigure: boolean;
  latitude: number;
  longitude: number;
  profileType: string;
  profileTypes: string[];
  hasPendingRequest: boolean;
  answers?: ProfileAnswer[];
  friend: boolean;
}

interface UseCurrentUserProfileReturn {
  profile: CurrentUserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
}

export const useCurrentUserProfile = (): UseCurrentUserProfileReturn => {
  const { send } = useApiRequest<ApiResponse>();
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await send('get', '/users/me');
      
      if (result?.errors) {
        setError(result.errors);
        return;
      }
      
      if (result) {
        setProfile(result as unknown as CurrentUserProfile);
      }
    } catch (err) {
      console.error('Error fetching current user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [send]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  // Remove auto-fetch to prevent infinite loops
  // Profile will be fetched manually when needed

  return {
    profile,
    loading,
    error,
    fetchProfile,
    clearProfile
  };
};

export default useCurrentUserProfile;
