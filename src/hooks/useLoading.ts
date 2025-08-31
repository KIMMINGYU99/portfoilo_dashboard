import { useState, useCallback } from "react";

interface UseLoadingReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export function useLoading(initialLoading = false): UseLoadingReturn {
  const [loading, setLoading] = useState(initialLoading);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setLoading(true);
        const result = await asyncFn();
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

// 여러 로딩 상태를 관리하는 훅
export function useMultipleLoading(
  keys: string[]
): Record<string, UseLoadingReturn> {
  const loadingStates = {} as Record<string, UseLoadingReturn>;

  keys.forEach((key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    loadingStates[key] = useLoading();
  });

  return loadingStates;
}

// 전역 로딩 상태 관리
interface GlobalLoadingState {
  [key: string]: boolean;
}

let globalLoadingState: GlobalLoadingState = {};
let globalLoadingListeners: Array<(state: GlobalLoadingState) => void> = [];

export function useGlobalLoading() {
  const [, forceUpdate] = useState({});

  const setGlobalLoading = useCallback((key: string, loading: boolean) => {
    if (loading) {
      globalLoadingState[key] = true;
    } else {
      delete globalLoadingState[key];
    }

    globalLoadingListeners.forEach((listener) => listener(globalLoadingState));
    forceUpdate({});
  }, []);

  const isAnyLoading = Object.keys(globalLoadingState).length > 0;
  const loadingKeys = Object.keys(globalLoadingState);

  return {
    isAnyLoading,
    loadingKeys,
    setGlobalLoading,
    globalLoadingState: { ...globalLoadingState },
  };
}

// 특정 키에 대한 전역 로딩 상태 관리
export function useGlobalLoadingKey(key: string) {
  const { setGlobalLoading } = useGlobalLoading();
  const [loading, setLocalLoading] = useState(false);

  const setLoading = useCallback(
    (loading: boolean) => {
      setLocalLoading(loading);
      setGlobalLoading(key, loading);
    },
    [key, setGlobalLoading]
  );

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setLoading(true);
        const result = await asyncFn();
        return result;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    loading,
    setLoading,
    withLoading,
  };
}
