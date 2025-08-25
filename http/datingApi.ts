import { http } from './http';
import { DatingMatchesResponse } from '@/types';

export const datingApi = {
  /**
   * Get dating match suggestions
   * @returns Promise<DatingMatchesResponse | null>
   */
  getMatchSuggestions: async (): Promise<DatingMatchesResponse | null> => {
    try {
      const response = await http.post<DatingMatchesResponse>('/matches/suggestions', {
        page: 1,
        pageSize: 10,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dating matches:', error);
      return null;
    }
  },
};