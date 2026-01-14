import TitleBar from "./TitleBar";
import Tiptap from "../../editor/tiptap";
import { useLayout } from "../../context/LayoutContext";
import { useEffect, useRef } from "react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useWorkspaceShortcuts } from "../../hooks/useWorkspaceShortcuts";
import { performFileSave } from "../../utils/fileSystem";
import { TabBar } from "./TabBar";
import SettingsView from "../views/SettingsView";
import DashboardView from "../views/DashboardView";

const Workspace = () => {
  const {
    tabs,
    activeTabId,
    removeTab,
    addTab,
    focusNext,
    focusPrev,
    updateTab,
    setIsRenamingTabId,
  } = useWorkspace();
  const { isSidebarOpen } = useLayout();
  const tabsContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleFileSave = async () => {
    if (!activeTab || activeTab.type !== 'editor') return;
    performFileSave(activeTab, updateTab);
  };

  useEffect(() => {
    if (activeTabId && tabsContainerRef.current) {
      const activeTabElement = tabRefs.current.get(activeTabId);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [activeTabId]);

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (activeTab?.type === 'editor' && activeTab.state) {
      activeTab.state.commands.focus();
    }
  }, [activeTabId, tabs]);

  useWorkspaceShortcuts({
    addTab,
    closeTab: removeTab,
    focusNextTab: focusNext,
    focusPrevTab: focusPrev,
    handleSaveFile: handleFileSave,
    startRenameTab: () => {
      if (activeTab?.type === 'editor') {
        setIsRenamingTabId(activeTabId);
      }
    },
  });

  const renderActiveContent = () => {
    if (!activeTab) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
              No file open
            </p>
            <button
              onClick={() => addTab()}
              className="px-4 py-2 bg-surface-elevated dark:bg-primary-bg-dark text-text-primary dark:text-text-primary-dark rounded-lg hover:opacity-80 transition-opacity"
            >
              Create New Tab
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab.type) {
      case 'editor':
        return <Tiptap editor={activeTab.state} />;
      case 'settings':
        return <SettingsView category={activeTab.category} />;
      case 'dashboard':
        return <DashboardView />;
      default:
        return <div>Unknown Tab Type</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <TitleBar>
        <TabBar tabRefs={tabRefs} tabsContainerRef={tabsContainerRef} />
      </TitleBar>
      <div
        className={`mt-10 pt-2 px-4 bg-primary-bg transition-all ${
          isSidebarOpen ? "rounded-l-2xl" : " rounded-l-none"
        } h-full dark:bg-primary-bg-dark overflow-scroll`}
        onClick={() => {
          if (activeTabId && tabsContainerRef.current) {
            const activeTabElement = tabRefs.current.get(activeTabId);
            if (activeTabElement) {
              activeTabElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
              });
            }
          }
        }}
      >
        {renderActiveContent()}
      </div>
    </div>
  );
};

export default Workspace;
