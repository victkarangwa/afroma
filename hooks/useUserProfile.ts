import { useState, useCallback } from 'react';
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

interface UserProfile {
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

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: number) => Promise<void>;
  clearProfile: () => void;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { send } = useApiRequest<ApiResponse>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: number) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await send('get', `/profile/${userId}`);
      
      if (result?.errors) {
        setError(result.errors);
        return;
      }
      
      if (result) {
        setProfile(result);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [send]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    clearProfile
  };
};

export default useUserProfile;
