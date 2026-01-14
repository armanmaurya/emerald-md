import { useHotkeys } from "react-hotkeys-hook";
import { WORKSPACE_SHORTCUTS as SC } from "../config/shortcuts";
import { performFileOpen } from "../utils/fileSystem";

type UseWorkspaceShortcutsProps = {
  addTab: (path?: string, title?: string, content?: string) => void;
  closeTab: () => void;
  focusNextTab: () => void;
  focusPrevTab: () => void;
  handleSaveFile?: () => void;
  startRenameTab: () => void;
};

export const useWorkspaceShortcuts = (actions: UseWorkspaceShortcutsProps) => {
  useHotkeys(
    SC.NEW_TAB,
    (event) => {
      event.preventDefault();
      actions.addTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions]
  );

  useHotkeys(
    SC.CLOSE_TAB,
    (event) => {
      event.preventDefault();
      actions.closeTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions]
  );

  useHotkeys(
    SC.NEXT_TAB,
    (event) => {
      event.preventDefault();
      actions.focusNextTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions]
  );

  useHotkeys(
    SC.PREV_TAB,
    (event) => {
      event.preventDefault();
      actions.focusPrevTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions]
  );

  useHotkeys(
    SC.SAVE_FILE,
    (event) => {
      event.preventDefault();
      actions.handleSaveFile?.();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions]
  );

  useHotkeys(
    SC.OPEN_FILE,
    (event) => {
      event.preventDefault();
      performFileOpen().then((result) => {
        if (result) {
          const fileName = result.path.split("\\").pop() || "Untitled";
          const title = fileName.replace(/\.md$/, "");
          actions.addTab(result.path, title, result.content);
        }
      });
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions]
  );

  useHotkeys(
    SC.RENAME_FILE,
    (event) => {
      event.preventDefault();
      actions.startRenameTab();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [actions]
  );
};
