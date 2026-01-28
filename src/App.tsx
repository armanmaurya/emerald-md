import { useEffect, useRef } from "react";
import "./App.css";
import SideBar from "./components/layout/SideBar";
import Workspace from "./components/layout/Workspace";
import { useLayout } from "./context/LayoutContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ui/ToastContainer";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useWorkspace } from "./hooks/useWorkspace";

function App() {
  const { isSidebarOpen } = useLayout();

  return (
    <div className="app bg-surface dark:bg-surface-dark min-h-screen">
      <ToastProvider>
        <WorkspaceProvider>
          <FileOpenListener />
          <WindowCloseListener />
          <SideBar />
          <main
            className="transition-all duration-300"
            style={{ marginLeft: isSidebarOpen ? "16rem" : "0" }}
          >
            <Workspace />
          </main>
          <ToastContainer />
        </WorkspaceProvider>
      </ToastProvider>
    </div>
  );
}

function FileOpenListener() {
  const { addTab } = useWorkspace();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const handleFileOpen = async (filePath: string) => {
      try {
        const content = await readTextFile(filePath);
        const fileName = filePath.split("\\").pop() || "Untitled";
        const title = fileName.replace(/\.md$/, "");
        addTab("editor", { path: filePath, title, content });
      } catch (error) {
        console.error("Failed to open file:", error);
      }
    };

    const setupFileOpenListener = async () => {
      try {
        // Listen for file-open events (from single instance plugin or startup)
        await listen<string>("file-open", (event) => {
          const filePath = event.payload;
          handleFileOpen(filePath);
        });

        // Check if a file is being opened from CLI args
        const hasFile = await invoke<boolean>("get_cli_args");

        // Only add default untitled tab if no file is being opening
        if (!hasFile) {
          addTab();
        }

        // Show window after listener is set up and initial tab is added
        await invoke("show_main_window");
      } catch (error) {
        console.error("Failed to setup file open listener:", error);
      }
    };

    setupFileOpenListener();
  }, [addTab]);

  return null;
}

function WindowCloseListener() {
  const {
    tabs,
    setShowConfirmDialog,
    setPendingCloseTabId,
    setPendingAction,
  } = useWorkspace();
  const listenerUnsubscribe = useRef<(() => void) | null>(null);
  const bypassConfirmation = useRef(false);
  const tabsRef = useRef(tabs);

  // Keep tabsRef in sync with tabs
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    const setupWindowCloseListener = async () => {
      try {
        const appWindow = getCurrentWebviewWindow();

        // Listen for the close-requested event
        const unsubscribe = await appWindow.onCloseRequested(async (event) => {
          // Skip confirmation if we're programmatically closing
          if (bypassConfirmation.current) {
            return;
          }

          // Check if any editor tab has unsaved changes using the ref
          const hasUnsavedTabs = tabsRef.current.some(
            (tab) => tab.type === "editor" && tab.isDirty,
          );

          if (hasUnsavedTabs) {
            // Prevent the default window close
            event.preventDefault();

            // Set pending action to close window
            setPendingAction("close-window");

            // Show confirmation dialog
            setShowConfirmDialog(true);

            // Set a marker that we're closing the window
            setPendingCloseTabId("__window-close__");
          }
        });

        listenerUnsubscribe.current = unsubscribe;
      } catch (error) {
        console.error("Failed to setup window close listener:", error);
      }
    };

    setupWindowCloseListener();

    // Store references in window object so WorkspaceContext can access them
    (window as any).__closeBypassRef = bypassConfirmation;
    (window as any).__closeListenerUnsubscribe = listenerUnsubscribe;

    return () => {
      if (listenerUnsubscribe.current) {
        listenerUnsubscribe.current();
      }
    };
  }, [setShowConfirmDialog, setPendingCloseTabId, setPendingAction]);

  return null;
}

export default App;

