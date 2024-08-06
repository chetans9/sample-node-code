import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface UseAxiosReturn<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError<any> | null;
  refetch: () => Promise<void>;
}

const useAxios = <T = any>(url: string, options: AxiosRequestConfig = {}, autoFetch: boolean = true): UseAxiosReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError<any> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AxiosResponse<T> = await axios(url, options);
      setData(response.data);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

export default useAxios;
