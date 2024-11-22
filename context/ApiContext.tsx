import React, { createContext, useState, ReactNode } from "react";
import { AxiosRequestConfig } from "axios";

import { http } from "@/http/http";
import { usePathname, useRouter } from "expo-router";
import { removeUserData } from "@/utils";

interface ApiContextProps {
  request: <T>(
    reqType: RequestType,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<T | null>;
  loading: boolean;
  error: string | null;
}

type RequestType = "get" | "post" | "patch" | "delete" | "put";

const ApiContext = createContext<ApiContextProps | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const request = async <T,>(
    reqType: RequestType,
    url: string,
    data: any = null,
    config: AxiosRequestConfig = {}
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await http[reqType](url, data, config);
      setLoading(false);
      return response.data as T;
    } catch (err: any) {
      const status = err?.status;
      const message =
        err?.data?.message || "Something went wrong. Please try again.";
      let errors = "";
      if  (status === 401 && !path.includes("login")) {
        removeUserData();
        router.push({ pathname: "/getStarted/login" });
      } else {
        setError(message);
        errors = message;
      }
      setLoading(false);
      return { errors } as unknown as T;
    }
  };

  return (
    <ApiContext.Provider value={{ request, loading, error }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = React.useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
