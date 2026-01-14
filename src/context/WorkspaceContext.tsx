import { Editor } from "@tiptap/react";
import { createContext, useState, ReactNode} from "react";
import { createEditor } from "../utils/createEditor";
import { performFileRename } from "../utils/fileSystem";
import { v4 as uuidv4 } from "uuid";

export type TabState = {
  id: string;
  path?: string | null;
  title?: string;
  state: Editor;
  isDirty: boolean;
};

type IWorkspace = {
  tabs: TabState[];
  addTab: (path?: string, title?: string, content?: string) => void;
  removeTab: (id?: string) => void;
  updateTab: (id: string, updates: Partial<TabState>) => void;
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  focusNext: () => void;
  focusPrev: () => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  renameTab: (id: string, newName: string) => Promise<void>;
  isRenamingTabId: string | null;
  setIsRenamingTabId: (id: string | null) => void;
};

export const WorkspaceContext = createContext<IWorkspace | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  
  const [tabs, setTabsState] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isRenamingTabId, setIsRenamingTabId] = useState<string | null>(null);

  const addTab = (path?: string, title?: string, content?: string) => {
    const idToActivate = uuidv4();
    setTabsState((prevTabs) => {
      // If tab with path already exists, focus it instead
      if (path) {
        const existingTab = prevTabs.find((t) => t.path === path);
        if (existingTab) {
          setActiveTabId(existingTab.id);
          return prevTabs;
        }
      }

      // Create new tab with provided parameters or defaults
      const newTab: TabState = {
        id: idToActivate,
        path: path,
        title: title || `Untitled-${Math.max(...prevTabs.map((t) => {
          const match = t.title?.match(/Untitled-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }), 0) + 1}`,
        state: createEditor({ content: content || "" }),
        isDirty: false,
      };

      setActiveTabId(newTab.id);
      return [...prevTabs, newTab];
    });
  };

  const removeTab = (id?: string) => {
    const idToRemove = id || activeTabId;
    if (!idToRemove) return;

    if (activeTabId === idToRemove) {
      const currentIndex = tabs.findIndex((tab) => tab.id === idToRemove);
      const remainingTabs = tabs.filter((tab) => tab.id !== idToRemove);
      
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
    
    setTabsState((prevTabs) => prevTabs.filter((tab) => tab.id !== idToRemove));
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

  const reorderTabs = (fromIndex: number, toIndex: number) => {
    setTabsState((prevTabs) => {
      const newTabs = [...prevTabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return newTabs;
    });
  };

  const renameTab = async (id: string, newName: string) => {
    const tabToRename = tabs.find((tab) => tab.id === id);
    if (!tabToRename) return;

    // If it's a file tab, rename the file
    if (tabToRename.path) {
      const newPath = await performFileRename(tabToRename.path, newName);
      if (newPath) {
        updateTab(id, { path: newPath, title: newName });
      }
    } else {
      // For unsaved tabs, just update the title
      updateTab(id, { title: newName });
    }
    
    // Clear renaming state
    setIsRenamingTabId(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{ tabs, addTab, removeTab, updateTab, activeTabId, setActiveTabId, focusNext, focusPrev, reorderTabs, renameTab, isRenamingTabId, setIsRenamingTabId }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
