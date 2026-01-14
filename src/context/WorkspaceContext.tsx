import { Editor } from "@tiptap/react";
import { createContext, useState, ReactNode, useEffect} from "react";
import { createEditor } from "../utils/createEditor";
import { performFileRename } from "../utils/fileSystem";
import { v4 as uuidv4 } from "uuid";

export type TabType = 'editor' | 'settings' | 'dashboard';

export interface BaseTab {
  id: string;
  title: string;
}

export interface EditorTab extends BaseTab {
  type: 'editor';
  path?: string | null;
  state: Editor;
  isDirty: boolean;
}

export interface SettingsTab extends BaseTab {
  type: 'settings';
  category?: 'general' | 'appearance' | 'shortcuts';
}

export interface DashboardTab extends BaseTab {
  type: 'dashboard';
}

export type TabState = EditorTab | SettingsTab | DashboardTab;

type IWorkspace = {
  tabs: TabState[];
  addTab: (type?: TabType, config?: any) => void;
  removeTab: (id?: string) => void;
  updateTab: (id: string, updates: Partial<EditorTab>) => void;
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  focusNext: () => void;
  focusPrev: () => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  renameTab: (id: string, newName: string) => Promise<void>;
  isRenamingTabId: string | null;
  setIsRenamingTabId: (id: string | null) => void;
  recentFiles: string[];
};

export const WorkspaceContext = createContext<IWorkspace | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  
  const [tabs, setTabsState] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isRenamingTabId, setIsRenamingTabId] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  // Load recent files from storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recent_files");
    if (saved) {
      try {
        setRecentFiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent files", e);
      }
    }
  }, []);

  // Helper to add a file to the top of the list
  const addToRecents = (path: string) => {
    setRecentFiles((prev) => {
      // Remove if path already exists to move it to the top
      const filtered = prev.filter((p) => p !== path);
      const updated = [path, ...filtered].slice(0, 10); // Keep top 10
      localStorage.setItem("recent_files", JSON.stringify(updated));
      return updated;
    });
  };

  const addTab = (type: TabType = 'editor', config: any = {}) => {
    const idToActivate = uuidv4();
    
    setTabsState((prevTabs) => {
      let newTab: TabState;

      if (type === 'settings') {
        // Check if settings tab already exists
        const existingSettingsTab = prevTabs.find((t) => t.type === 'settings');
        if (existingSettingsTab) {
          setActiveTabId(existingSettingsTab.id);
          return prevTabs;
        }

        // Create new Settings Tab
        newTab = {
          id: idToActivate,
          type: 'settings',
          title: 'Settings',
          category: config.category || 'general'
        } as SettingsTab;
      } else if (type === 'dashboard') {
        // Create new Dashboard Tab
        newTab = {
          id: idToActivate,
          type: 'dashboard',
          title: 'Dashboard'
        } as DashboardTab;
      } else {
        // Logic for creating an Editor Tab
        const path = config.path;
        const title = config.title;
        const content = config.content;

        // If a path is provided, it's a real file, so add to recents
        if (path) {
          addToRecents(path);
          
          // If tab with path already exists, focus it instead
          const existingTab = prevTabs.find((t) => t.type === 'editor' && t.path === path);
          if (existingTab) {
            setActiveTabId(existingTab.id);
            return prevTabs;
          }
        }

        newTab = {
          id: idToActivate,
          type: 'editor',
          path: path,
          title: title || `Untitled-${Math.max(...prevTabs
            .filter(t => t.type === 'editor')
            .map((t) => {
              const match = t.title?.match(/Untitled-(\d+)/);
              return match ? parseInt(match[1]) : 0;
            }), 0) + 1}`,
          state: createEditor({ content: content || "" }),
          isDirty: false,
        } as EditorTab;
      }

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

  const updateTab = (id: string, updates: Partial<EditorTab>) => {
    setTabsState((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === id && tab.type === 'editor') {
          // Only allow updating EditorTabs
          return { ...tab, ...updates } as EditorTab;
        }
        return tab;
      })
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

    // Only allow renaming for Editor tabs
    if (tabToRename.type !== 'editor') return;

    // If it's a file tab, rename the file
    if (tabToRename.path) {
      const newPath = await performFileRename(tabToRename.path, newName);
      if (newPath) {
        updateTab(id, { path: newPath, title: newName } as Partial<EditorTab>);
      }
    } else {
      // For unsaved tabs, just update the title
      updateTab(id, { title: newName } as Partial<EditorTab>);
    }
    
    // Clear renaming state
    setIsRenamingTabId(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{ tabs, addTab, removeTab, updateTab, activeTabId, setActiveTabId, focusNext, focusPrev, reorderTabs, renameTab, isRenamingTabId, setIsRenamingTabId, recentFiles }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
