import LocalStorage from "./storage";

export interface AuthToken {
  token: string;
  expiresAt: string;
}

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const authToken = await LocalStorage.getItem<string>("authToken");
    const tokenExpiresAt = await LocalStorage.getItem<string>("tokenExpiresAt");
    
    if (!authToken || !tokenExpiresAt) {
      return false;
    }
    
    const expirationDate = new Date(tokenExpiresAt);
    const currentDate = new Date();
    
    return currentDate < expirationDate;
  } catch (error) {
    console.error("Error checking auth status:", error);
    return false;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) {
      return null;
    }
    
    return await LocalStorage.getItem<string>("authToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await LocalStorage.removeItem("authToken");
    await LocalStorage.removeItem("tokenExpiresAt");
    await LocalStorage.removeItem("token"); // Clear old token for backward compatibility
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

export const saveAuthData = async (token: string, expiresAt: string): Promise<void> => {
  try {
    await LocalStorage.setItem("authToken", token);
    await LocalStorage.setItem("tokenExpiresAt", expiresAt);
  } catch (error) {
    console.error("Error saving auth data:", error);
  }
}; 