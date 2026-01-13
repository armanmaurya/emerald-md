import TitleBar from "./TitleBar";
import SortableItem from "../ui/SortableTab";
import Tiptap from "../../editor/tiptap";
import { FaPlus } from "react-icons/fa";
import { useLayout } from "../../context/LayoutContext";
import { useEffect, useRef } from "react";
import { CgClose } from "react-icons/cg";
import { GoDotFill } from "react-icons/go";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useWorkspaceShortcuts } from "../../hooks/useWorkspaceShortcuts";
import { performFileSave } from "../../utils/fileSystem";

const Workspace = () => {
  const {
    tabs,
    setActiveTabId,
    activeTabId,
    removeTab,
    addTab,
    focusNext,
    focusPrev,
    updateTab,
    reorderTabs,
  } = useWorkspace();
  const { isSidebarOpen } = useLayout();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      reorderTabs(oldIndex, newIndex);
    }
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleFileSave = async () => {
    if (!activeTab) return;
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
    if (activeTab?.state) {
      activeTab.state.commands.focus();
    }
  }, [activeTabId, tabs]);

  useWorkspaceShortcuts({
    addTab,
    closeTab: removeTab,
    focusNextTab: focusNext,
    focusPrevTab: focusPrev,
    handleSaveFile: handleFileSave,
  });

  return (
    <div className="flex flex-col h-screen">
      <TitleBar>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <div
            ref={tabsContainerRef}
            className="select-none h-full items-center flex space-x-1"
          >
            <SortableContext
              items={tabs.map((tab) => tab.id)}
              strategy={horizontalListSortingStrategy}
            >
              {tabs.map((tab) => (
                <SortableItem
                  key={tab.id}
                  id={tab.id}
                  onActivate={() => setActiveTabId(tab.id)}
                  className={`p-2 h-full flex items-center space-x-2 px-2 hover:cursor-pointer text-text-primary dark:text-text-primary-dark rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTabId === tab.id &&
                    "bg-surface-elevated dark:bg-primary-bg-dark"
                  }`}
                  tabRef={(el) => {
                    if (el) {
                      tabRefs.current.set(tab.id, el);
                    } else {
                      tabRefs.current.delete(tab.id);
                    }
                  }}
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
                </SortableItem>
              ))}
            </SortableContext>
            <div
              onClick={() => addTab()}
              className="p-2 hover:bg-surface-hover dark:hover:bg-surface-hover-dark rounded-full sticky transition-all bg-surface dark:bg-surface-dark right-0 hover:cursor-pointer text-text-primary dark:text-text-primary-dark whitespace-nowrap"
            >
              <FaPlus size={12} />
            </div>
          </div>
        </DndContext>
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

export default Workspace;
