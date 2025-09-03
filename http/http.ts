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
        console.log('Adding Bearer token to request:', authToken);
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
      console.log(error.response?.status );
      console.log('Unauthorized request, clearing auth data');
      
      try {
        // Clear authentication data
        await clearAuthData();
        
        // Note: Router redirection is handled in ApiContext to avoid circular dependencies
        // console.log('Auth data cleared due to 401 error');
      } catch (clearError) {
        // console.error('Error clearing auth data:', clearError);
      }
    } else if (error.response?.status === 403) {
      console.log('Forbidden request - access denied');
    } else if (error.response?.status === 404) {
      console.log('Resource not found');
    } else if (error.response?.status >= 500) {
      console.log('Server error occurred');
    }

    return Promise.reject(error.response)
  },
)

export { http }
