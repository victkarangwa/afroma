import { useState } from 'react';
import useApiRequest from './useApiRequest';
import { ApiResponse } from '@/types';

interface ForgetPasswordRequest {
  email: string;
}

interface VerifyTokenRequest {
  email: string;
  token: number;
}

interface ResetPasswordRequest {
  email: string;
  password: string;
  token: string;
}

interface PasswordResetResponse {
  success: boolean;
  errors?: string;
}

export const usePasswordReset = () => {
  const { loading, send, error } = useApiRequest<ApiResponse>();
  const [isLoading, setIsLoading] = useState(false);

  const forgetPassword = async (data: ForgetPasswordRequest): Promise<PasswordResetResponse> => {
    try {
      setIsLoading(true);
      
      const result = await send("post", "/auth/forget-password", {
        email: data.email,
      });

      if (result?.errors) {
        return {
          success: false,
          errors: result.errors
        };
      }

      return {
        success: result?.success || false,
        errors: result?.errors
      };
    } catch (error) {
      console.error("Forget password error:", error);
      return {
        success: false,
        errors: "An error occurred while sending reset email. Please try again."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetToken = async (data: VerifyTokenRequest): Promise<PasswordResetResponse> => {
    try {
      setIsLoading(true);
      
      const result = await send("post", "/auth/verify-forget-password-token", {
        email: data.email,
        token: data.token,
      });

      if (result?.errors) {
        return {
          success: false,
          errors: result.errors
        };
      }

      return {
        success: result?.success || false,
        errors: result?.errors
      };
    } catch (error) {
      console.error("Verify token error:", error);
      return {
        success: false,
        errors: "An error occurred during verification. Please try again."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest): Promise<PasswordResetResponse> => {
    try {
      setIsLoading(true);
      
      const result = await send("post", "/auth/reset-password", {
        email: data.email,
        password: data.password,
        token: data.token,
      });

      if (result?.errors) {
        return {
          success: false,
          errors: result.errors
        };
      }

      return {
        success: result?.success || false,
        errors: result?.errors
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        errors: "An error occurred while resetting password. Please try again."
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    forgetPassword,
    verifyResetToken,
    resetPassword,
    loading: loading || isLoading,
    error
  };
};

export default usePasswordReset;
