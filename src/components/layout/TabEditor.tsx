import { CgClose } from "react-icons/cg";
import { useTabEditor } from "../../context/TabEditorContext";
import TitleBar from "./TitleBar";
import Tiptap from "../../editor/tiptap";
import { FaPlus } from "react-icons/fa";
import { useLayout } from "../../context/LayoutContext";
import { useEffect, useRef } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { motion, AnimatePresence } from "motion/react";
import { GoDotFill } from "react-icons/go";

const TabEditor = () => {
  const {
    tabs,
    setActiveTabId,
    activeTabId,
    removeTab,
    addTab,
    focusNext,
    focusPrev,
    updateTab,
  } = useTabEditor();
  const { isSidebarOpen } = useLayout();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
    if (activeTab?.state) {
      activeTab.state.commands.focus();
    }
  }, [activeTabId, tabs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Tab to focus next tab
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          focusPrev();
        } else {
          focusNext();
        }
      }
      // Ctrl+W to close current tab
      if (e.ctrlKey && e.key === "w") {
        e.preventDefault();
        if (activeTabId) {
          removeTab(activeTabId);
        }
      }
      // Ctrl+T to create new tab
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        addTab();
      }
      // Ctrl+S to save current tab
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        const activeTab = tabs.find((tab) => tab.id === activeTabId);
        if (activeTab) {
          const markdown = activeTab.state.getMarkdown();

          if (!activeTab.path) {
            console.log("No path for active tab.");
            // If no path, open save dialog
            save({
              filters: [{ name: "Markdown", extensions: ["md"] }],
            }).then((filePath) => {
              if (filePath) {
                const fileName = filePath.split("\\").pop() || "Untitled";
                const title = fileName.replace(/\.md$/, "");

                writeTextFile(filePath, markdown)
                  .then(() => {
                    updateTab(activeTab.id, { path: filePath, title });
                    console.log("Saved tab to:", filePath);
                    console.log("Updated title to:", title);
                  })
                  .catch((error) => {
                    console.error("Error saving file:", error);
                  });
              }
            });
          } else {
            writeTextFile(activeTab.path, markdown)
              .then(() => {
                console.log("Saved tab:", activeTab.path);
              })
              .catch((error) => {
                console.error("Error saving file:", error);
              });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusNext, focusPrev, activeTabId, removeTab, addTab, updateTab, tabs]);

  console.log("activeTabId:", activeTabId);

  return (
    <div className="flex flex-col h-screen">
      <TitleBar>
        <div
          ref={tabsContainerRef}
          className="select-none h-full items-center flex space-x-1"
        >
          <AnimatePresence>
            {tabs.map((tab) => (
              <motion.div
                ref={(el) => {
                  if (el) {
                    tabRefs.current.set(tab.id, el);
                  } else {
                    tabRefs.current.delete(tab.id);
                  }
                }}
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`p-2 h-full flex items-center space-x-2 px-2 hover:cursor-pointer text-text-primary dark:text-text-primary-dark rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTabId === tab.id &&
                  "bg-surface-elevated dark:bg-primary-bg-dark"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span>{tab.title}</span>
                {tab.isDirty ? (
                  <GoDotFill className="text-accent" size={10} />
                ) : (
                  <CgClose
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div
            onClick={() => addTab()}
            className="p-2 hover:bg-surface-hover dark:hover:bg-surface-hover-dark rounded-full sticky transition-all bg-surface dark:bg-surface-dark right-0 hover:cursor-pointer text-text-primary dark:text-text-primary-dark whitespace-nowrap"
          >
            <FaPlus size={12} />
          </div>
        </div>
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
        {tabs.find((tab) => tab.id === activeTabId) ? (
          <Tiptap editor={tabs.find((tab) => tab.id === activeTabId)!.state} />
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default TabEditor;
