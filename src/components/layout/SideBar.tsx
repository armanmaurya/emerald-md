import { useLayout } from "../../context/LayoutContext";
import { useTheme } from "../../context/ThemeContext";
import { MdLightMode, MdDarkMode } from "react-icons/md";
// import { IoSettings } from "react-icons/io5";
import { useWorkspace } from "../../hooks/useWorkspace";
import {
  performFileOpen,
  fileExists,
  revealInFileExplorer,
} from "../../utils/fileSystem";
import { useToast } from "../../hooks/useToast";
import { FaFolderOpen } from "react-icons/fa";
import { IoLogoMarkdown } from "react-icons/io";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import ContextMenu, { MenuItem } from "../ui/ContextMenu";

type SideBarProps = {
  className?: string;
};

const SideBar = (props: SideBarProps) => {
  const { addTab, recentFiles, removeFromRecents, clearRecents } =
    useWorkspace();
  const { isSidebarOpen } = useLayout();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const openFileButtonRef = useRef<HTMLButtonElement>(null);
  const recentFileButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    isOpen: boolean;
    filePath?: string;
  }>({ x: 0, y: 0, isOpen: false });

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleOpenFile = async () => {
    const result = await performFileOpen();
    if (result) {
      const fileName = result.path.split("\\").pop() || "Untitled";
      const title = fileName.replace(/\.md$/, "");
      addTab("editor", { path: result.path, title, content: result.content });
    }
  };

  const handleRecentFileClick = async (path: string) => {
    // Check if file exists before opening
    const exists = await fileExists(path);
    if (!exists) {
      // Remove file from recents if it doesn't exist
      removeFromRecents(path);
      addToast("File doesn't exist", "error", 3000);
      return;
    }

    const result = await performFileOpen(path);
    if (result) {
      const fileName = result.path.split("\\").pop() || "Untitled";
      const title = fileName.replace(/\.md$/, "");
      addTab("editor", { path: result.path, title, content: result.content });
    }
  };

  const handleRecentFileContextMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    filePath: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true, filePath });
  };

  const getRecentFileContextMenuItems = (filePath: string): MenuItem[] => {
    return [
      {
        id: "open",
        label: "Open",
        onClick: () => handleRecentFileClick(filePath),
      },
      {
        id: "open-new-tab",
        label: "Open in New Tab",
        onClick: async () => {
          const exists = await fileExists(filePath);
          if (!exists) {
            removeFromRecents(filePath);
            addToast("File doesn't exist", "error", 3000);
            return;
          }

          const result = await performFileOpen(filePath);
          if (result) {
            const fileName = result.path.split("\\").pop() || "Untitled";
            const title = fileName.replace(/\.md$/, "");
            addTab("editor", {
              path: result.path,
              title,
              content: result.content,
            });
          }
        },
      },
      {
        id: "reveal",
        label: "Reveal in Explorer",
        onClick: async () => {
          try {
            await revealInFileExplorer(filePath);
          } catch {
            addToast("Failed to reveal file", "error", 3000);
          }
        },
      },
      {
        id: "remove",
        label: "Remove from Recent",
        isDanger: true,
        onClick: () => removeFromRecents(filePath),
      },
      {
        id: "clear-all",
        label: "Clear All Recent",
        isDanger: true,
        onClick: () => clearRecents(),
      },
    ];
  };

  return (
    <aside
      className={`top-0 h-screen fixed bg-surface dark:bg-surface-dark dark:text-primary-bg transition-all duration-300 ease-in-out z-10 ${
        props.className || ""
      } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      style={{ width: "16rem" }}
    >
      <ContextMenu
        items={
          contextMenu.filePath
            ? getRecentFileContextMenuItems(contextMenu.filePath)
            : []
        }
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />
      <div className="p-4">
        <div className="flex justify-between">
          <div className="text-xl font-bold">Options</div>
          <button
            ref={themeButtonRef}
            onClick={handleThemeToggle}
            className="p-2 px-2 rounded transition-colors hover:cursor-pointer hover:bg-primary-bg dark:hover:bg-primary-bg-dark text-text-primary dark:text-text-primary-dark"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <motion.div
              key={theme}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {theme === "light" ? (
                <MdDarkMode size={18} />
              ) : (
                <MdLightMode size={18} />
              )}
            </motion.div>
          </button>
        </div>
        <div className="flex gap-2 py-2">
          <button
            ref={openFileButtonRef}
            onClick={handleOpenFile}
            className="p-2 rounded flex items-center space-x-2 w-full justify-center hover:cursor-pointer hover:bg-surface-hover dark:hover:bg-surface-hover-dark bg-surface-elevated dark:bg-surface-elevated-dark transition-all"
            title="Open File"
          >
            <FaFolderOpen size={20} />
          </button>
          {/* <button
            onClick={() => addTab("settings")}
            className="p-2 rounded flex items-center space-x-2 w-full justify-center hover:cursor-pointer hover:bg-surface-hover dark:hover:bg-surface-hover-dark bg-surface-elevated dark:bg-surface-elevated-dark transition-all"
            title="Open Settings"
          >
            <IoSettings size={18} />
          </button> */}
        </div>

        {/* Recent Files Section */}
        {recentFiles.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2 text-text-secondary dark:text-text-secondary-dark">
              Recent Files
            </div>
            <div className="space-y-1">
              {recentFiles.map((filePath, index) => {
                const fileName =
                  filePath.split("\\").pop()?.replace(/\.md$/, "") || filePath;
                return (
                  <button
                    key={index}
                    ref={(el) => {
                      recentFileButtonRefs.current[index] = el;
                    }}
                    onClick={() => handleRecentFileClick(filePath)}
                    onContextMenu={(e) =>
                      handleRecentFileContextMenu(e, filePath)
                    }
                    className="w-full hover:cursor-pointer group flex items-center justify-between text-left p-2 rounded text-sm hover:bg-surface-elevated dark:hover:bg-surface-elevated-dark transition-colors truncate"
                    title={filePath}
                  >
                    <div className="flex items-center space-x-2">
                      <IoLogoMarkdown size={16} />
                      <span className="truncate">{fileName}</span>
                    </div>
                    <div
                      onClick={(e) => {
                        removeFromRecents(filePath);
                        e.stopPropagation();
                      }}
                      className="group-hover:opacity-100 opacity-0 transition-opacity"
                    >
                      <CgClose size={12} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
