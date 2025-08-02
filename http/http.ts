import Axios from 'axios'
import Constants from 'expo-constants'

import config from '@/utils/localValues'
import LocalStorage from '@/utils/storage'
import { getAuthToken, checkAuthStatus, clearAuthData } from '@/utils/auth'

const authRequestInterceptor = async (settings: any) => {
  try {
    // Check if user is authenticated and token is valid
    const isAuthenticated = await checkAuthStatus();
    
    if (isAuthenticated) {
      // Get the valid auth token
      const authToken = await getAuthToken();
      
      if (authToken) {
        // Use Bearer token format for the new auth system
        settings.headers.Authorization = `Bearer ${authToken}`;
        console.log('Adding Bearer token to request:', authToken.substring(0, 20) + '...');
      }
    } else {
      // Fallback to old token system for backward compatibility
      const oldToken = await LocalStorage.getItem<string>(config.token);
      if (oldToken) {
        settings.headers.Authorization = oldToken;
        console.log('Using legacy token format');
      }
    }
    
    settings.headers.Origin = Constants.expoConfig?.extra?.origin;
    return settings;
  } catch (error) {
    console.error('Error in auth request interceptor:', error);
    // Continue without auth header if there's an error
    settings.headers.Origin = Constants.expoConfig?.extra?.origin;
    return settings;
  }
}

const http = Axios.create({
  baseURL: `${Constants.expoConfig?.extra?.apiUrl}/afroma-master-service`,
})

http.interceptors.request.use(authRequestInterceptor)

http.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    console.error('Axios Error:', error)

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('Unauthorized request, clearing auth data');
      
      try {
        // Clear authentication data
        await clearAuthData();
        
        // You could also redirect to login here if needed
        // For now, we'll just clear the data and let the app handle it
        console.log('Auth data cleared due to 401 error');
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
    }

    return Promise.reject(error.response)
  },
)

export { http }
