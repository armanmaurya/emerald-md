import { useEffect, useRef } from "react";
import "./App.css";
import SideBar from "./components/layout/SideBar";
import Workspace from "./components/layout/Workspace";
import { useLayout } from "./context/LayoutContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useWorkspace } from "./hooks/useWorkspace";

function App() {
  const { isSidebarOpen } = useLayout();

  return (
    <div className="app bg-surface dark:bg-surface-dark min-h-screen">
      <WorkspaceProvider>
        <FileOpenListener />
        <SideBar />
        <main
          className="transition-all duration-300"
          style={{ marginLeft: isSidebarOpen ? "16rem" : "0" }}
        >
          <Workspace />
        </main>
      </WorkspaceProvider>
    </div>
  );
}

function FileOpenListener() {
  const { addTab } = useWorkspace();
  const initialized = useRef(false);

  useEffect(() => {
    // Only run the setup once
    if (initialized.current) return;
    initialized.current = true;

    const handleFileOpen = async (filePath: string) => {
      try {
        const content = await readTextFile(filePath);
        const fileName = filePath.split("\\").pop() || "Untitled";
        const title = fileName.replace(/\.md$/, "");
        addTab(filePath, title, content);
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
        
        // Only add default untitled tab if no file is being opened
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

export default App;
