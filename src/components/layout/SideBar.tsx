import { useLayout } from "../../context/LayoutContext";
import { useTheme } from "../../context/ThemeContext";
import { MdLightMode, MdDarkMode } from "react-icons/md";
// import { IoSettings } from "react-icons/io5";
import { useWorkspace } from "../../hooks/useWorkspace";
import { performFileOpen, fileExists } from "../../utils/fileSystem";
import { useToast } from "../../hooks/useToast";
import { FaFolderOpen } from "react-icons/fa";
import { IoLogoMarkdown } from "react-icons/io";
import { motion } from "motion/react";
import { useRef } from "react";

type SideBarProps = {
  className?: string;
};

const SideBar = (props: SideBarProps) => {
  const { addTab, recentFiles, removeFromRecents } = useWorkspace();
  const { isSidebarOpen } = useLayout();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const openFileButtonRef = useRef<HTMLButtonElement>(null);
  const recentFileButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  return (
    <aside
      className={`top-0 h-screen fixed bg-surface dark:bg-surface-dark dark:text-primary-bg transition-all duration-300 ease-in-out z-10 ${
        props.className || ""
      } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      style={{ width: "16rem" }}
    >
      <div className="p-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Options</h2>
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
            <h3 className="text-sm font-semibold mb-2 text-text-secondary dark:text-text-secondary-dark">
              Recent Files
            </h3>
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
                    className="w-full hover:cursor-pointer text-left p-2 rounded text-sm hover:bg-surface-elevated dark:hover:bg-surface-elevated-dark transition-colors truncate"
                    title={filePath}
                  >
                    <div className="flex items-center space-x-2">
                      <IoLogoMarkdown size={16} />
                      <span className="truncate">{fileName}</span>
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
