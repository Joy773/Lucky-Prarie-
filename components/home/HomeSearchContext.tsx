"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type HomeSearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
};

const HomeSearchContext = createContext<HomeSearchContextValue | null>(null);

export function HomeSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState("");
  const setQuery = useCallback((value: string) => {
    setQueryState(value);
  }, []);

  const value = useMemo(
    () => ({
      query,
      setQuery,
    }),
    [query, setQuery]
  );

  return (
    <HomeSearchContext.Provider value={value}>{children}</HomeSearchContext.Provider>
  );
}

export function useHomeSearch() {
  const ctx = useContext(HomeSearchContext);
  if (!ctx) {
    throw new Error("useHomeSearch must be used within HomeSearchProvider");
  }
  return ctx;
}
