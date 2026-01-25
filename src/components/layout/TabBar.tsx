import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { FaPlus } from "react-icons/fa";
import SortableItem from "../ui/SortableItem";
import Tab from "../ui/Tab";
import { useWorkspace } from "../../hooks/useWorkspace";
import { revealInFileExplorer } from "../../utils/fileSystem";

interface TabBarProps {
  tabRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  tabsContainerRef?: React.RefObject<HTMLDivElement>;
}

export const TabBar = ({ tabRefs, tabsContainerRef }: TabBarProps) => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    removeTab,
    addTab,
    reorderTabs,
    renameTab,
    isRenamingTabId,
    setIsRenamingTabId,
    duplicateTab,
    closeOthers,
    closeAll,
  } = useWorkspace();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      reorderTabs(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
    >
      <div className="flex items-center gap-2 pl-1">
        <div
          ref={tabsContainerRef}
          className="select-none h-full items-center flex gap-0"
        >
          <SortableContext
            items={tabs.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableItem
                key={tab.id}
                id={tab.id}
                onActivate={() => setActiveTabId(tab.id)}
                className="h-full"
                tabRef={(el) =>
                  el
                    ? tabRefs.current.set(tab.id, el)
                    : tabRefs.current.delete(tab.id)
                }
              >
                <Tab
                  tab={tab}
                  title={tab.title || "Untitled"}
                  isActive={activeTabId === tab.id}
                  isDirty={tab.type === "editor" ? tab.isDirty : undefined}
                  tabType={tab.type}
                  onActivate={() => setActiveTabId(tab.id)}
                  onClose={() => removeTab(tab.id)}
                  onRename={
                    tab.type === "editor"
                      ? (newName) => renameTab(tab.id, newName)
                      : undefined
                  }
                  isRenaming={
                    tab.type === "editor"
                      ? isRenamingTabId === tab.id
                      : undefined
                  }
                  onCancelRename={
                    tab.type === "editor"
                      ? () => setIsRenamingTabId(null)
                      : undefined
                  }
                  onDuplicate={() => duplicateTab(tab.id)}
                  onCloseOthers={() => closeOthers(tab.id)}
                  onCloseAll={() => closeAll()}
                  totalTabs={tabs.length}
                  onRevealInExplorer={
                    tab.type === "editor" && tab.path
                      ? async () => {
                          try {
                            await revealInFileExplorer(tab.path!);
                          } catch {
                          }
                        }
                      : undefined
                  }
                  tabPath={tab.type === "editor" ? tab.path || undefined : undefined}
                />
              </SortableItem>
            ))}
          </SortableContext>
        </div>
        <button
          onClick={() => addTab()}
          className="p-2 hover:bg-surface-hover hover:cursor-pointer dark:hover:bg-surface-hover-dark rounded-full sticky right-0 transition-all bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark"
        >
          <FaPlus size={12} />
        </button>
      </div>
    </DndContext>
  );
};
