import { useState } from "react";

import { useApi } from "@/context/ApiContext";

const useApiRequest = <T>(
) => {
  const { request, loading, error } = useApi();
  const [responseData, setResponseData] = useState<T | null>(null);

  const getResponse = async (
    reqType: "get" | "put" | "post" | "patch" | "delete" ,
    url: string ,
    data?: any ,
    config?: object
  ) => {
    const result = await request<T>(reqType, url, data, config);
    setResponseData(result);
    return result;
  };

  return {
    data: responseData,
    loading,
    error,
    send: getResponse,
  };
};

export default useApiRequest;
