/**
 * Centralizes all keyboard shortcut definitions to ensure consistency across the app.
 * Use the 'mod' shorthand for cross-platform support (Cmd on Mac, Ctrl on Win/Linux).
 */

export const WORKSPACE_SHORTCUTS = {
  NEW_TAB: "mod+t",
  CLOSE_TAB: "mod+w",
  NEXT_TAB: "mod+tab",
  PREV_TAB: "mod+shift+tab",
  SAVE_FILE: "mod+s",
  OPEN_FILE: "mod+o",
  RENAME_FILE: "f2",
} as const;