import { createContext, useState, useCallback } from 'react';

export const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
  showLoading: () => {},
  hideLoading: () => {}
});

export function LoadingProvider({ children }) {
  const [counter, setCounter] = useState(0);
  const isLoading = counter > 0;

  const showLoading = useCallback(() => setCounter(c => c + 1), []);
  const hideLoading = useCallback(() => setCounter(c => Math.max(0, c - 1)), []);
  const setLoading = useCallback((v) => setCounter(v ? 1 : 0), []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
