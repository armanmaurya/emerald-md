import { Editor } from "@tiptap/react";
import { createContext, useState, ReactNode, useContext } from "react";
import { createEditor } from "../utils/createEditor";
import { v4 as uuidv4 } from "uuid";

export type TabState = {
  id: string;
  path?: string;
  title?: string;
  state: Editor;
  isDirty: boolean;
};

type TabEditorContextType = {
  tabs: TabState[];
  addTab: (tab?: TabState) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<TabState>) => void;
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  focusNext: () => void;
  focusPrev: () => void;
};

const TabEditorContext = createContext<TabEditorContextType | undefined>(
  undefined
);

export const TabEditorProvider = ({ children }: { children: ReactNode }) => {
  
  const [tabs, setTabsState] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const addTab = (tab?: TabState) => {
    const idToActivate = tab?.id || uuidv4();
    setTabsState((prevTabs) => {
      // If tab with path already exists, focus it instead
      if (tab?.path) {
        const existingTab = prevTabs.find((t) => t.path === tab.path);
        if (existingTab) {
          // Set active immediately for existing tab
          setActiveTabId(existingTab.id);
          return prevTabs; // Don't add a new tab
        }
      }

      // Generate unique path for new tabs
      const newTab = tab || {
        id: idToActivate,
        path: undefined,
        title: `Untitled-${Math.max(...prevTabs.map((t) => {
          const match = t.title?.match(/Untitled-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }), 0) + 1}`,
        state: createEditor({ content: "" }),
        isDirty: false,
      };

      // Set active immediately for new tab
      setActiveTabId(newTab.id);
      return [...prevTabs, newTab];
    });
  };

  const removeTab = (id: string) => {
    console.log("Removing tab:", id);
    if (activeTabId === id) {
      const currentIndex = tabs.findIndex((tab) => tab.id === id);
      const remainingTabs = tabs.filter((tab) => tab.id !== id);
      
      console.log("Current index:", currentIndex);
      console.log("Remaining tabs:", remainingTabs.length);
      
      if (remainingTabs.length > 0) {
        // Activate the previous tab (index - 1), or first tab if removing the first one
        const nextActiveIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        console.log("Next active index:", nextActiveIndex);
        console.log("Setting active tab to:", remainingTabs[nextActiveIndex].id);
        setActiveTabId(remainingTabs[nextActiveIndex].id);
      } else {
        console.log("No remaining tabs, setting active tab to null");
        setActiveTabId(null);
      }
    }
    
    setTabsState((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
  };

  const focusNext = () => {
    if (!activeTabId || tabs.length === 0) return;
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    setActiveTabId(tabs[nextIndex].id);
  };

  const focusPrev = () => {
    if (!activeTabId || tabs.length === 0) return;
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTabId(tabs[prevIndex].id);
  };

  const updateTab = (id: string, updates: Partial<TabState>) => {
    setTabsState((prevTabs) =>
      prevTabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    );
  };

  return (
    <TabEditorContext.Provider
      value={{ tabs, addTab, removeTab, updateTab, activeTabId, setActiveTabId, focusNext, focusPrev }}
    >
      {children}
    </TabEditorContext.Provider>
  );
};

export const useTabEditor = () => {
  const context = useContext(TabEditorContext);
  if (!context) {
    throw new Error("useTabEditor must be used within a TabEditorProvider");
  }
  return context;
};
