// src/context/LayoutContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type LayoutContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

const LAYOUT_STORAGE_KEY = "md-editor-layout";

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return saved ? JSON.parse(saved).isSidebarOpen : true;
  });

  const toggleSidebar = () => setIsSidebarOpen((prev: boolean) => !prev);

  const setSidebarOpenWithStorage = (open: boolean) => {
    setIsSidebarOpen(open);
  };

  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ isSidebarOpen }));
  }, [isSidebarOpen]);

  return (
    <LayoutContext.Provider
      value={{ isSidebarOpen, toggleSidebar, setSidebarOpen: setSidebarOpenWithStorage }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return ctx;
}
