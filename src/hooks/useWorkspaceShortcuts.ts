import { useHotkeys } from "react-hotkeys-hook";
import { WORKSPACE_SHORTCUTS as SC } from "../config/shortcuts";
import { performFileOpen } from "../utils/fileSystem";
import { TabType } from "../context/WorkspaceContext";
import { useLayout } from "../context/LayoutContext";

type UseWorkspaceShortcutsProps = {
  addTab: (type?: TabType, config?: any) => void;
  closeTab: () => void;
  focusNextTab: () => void;
  focusPrevTab: () => void;
  handleSaveFile?: () => void;
  startRenameTab: () => void;
  toggleViewMode?: () => void;
  isDialogOpen?: boolean;
};

export const useWorkspaceShortcuts = (actions: UseWorkspaceShortcutsProps) => {
  const { toggleSidebar } = useLayout();
  const { isDialogOpen = false } = actions;

  useHotkeys(
    SC.NEW_TAB,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      actions.addTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );

  useHotkeys(
    SC.CLOSE_TAB,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      actions.closeTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );

  useHotkeys(
    SC.NEXT_TAB,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      actions.focusNextTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );

  useHotkeys(
    SC.PREV_TAB,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      actions.focusPrevTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );

  useHotkeys(
    SC.SAVE_FILE,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      actions.handleSaveFile?.();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );

  useHotkeys(
    SC.OPEN_FILE,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      performFileOpen().then((result) => {
        if (result) {
          const fileName = result.path.split("\\").pop() || "Untitled";
          const title = fileName.replace(/\.md$/, "");
          actions.addTab("editor", {
            path: result.path,
            title,
            content: result.content,
          });
        }
      });
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );

  useHotkeys(
    SC.RENAME_FILE,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      actions.startRenameTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );

  useHotkeys(
    SC.TOGGLE_SIDEBAR,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      toggleSidebar();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [toggleSidebar, isDialogOpen]
  );

  useHotkeys(
    SC.TOGGLE_PREVIEW,
    (event) => {
      if (isDialogOpen) return;
      event.preventDefault();
      actions.toggleViewMode?.();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions, isDialogOpen]
  );
};
