import { useLayout } from "../../context/LayoutContext";
import { FiFileText } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useWorkspace } from "../../hooks/useWorkspace";
import { performFileOpen } from "../../utils/fileSystem";


type SideBarProps = {
  className?: string;
};

const SideBar = (props: SideBarProps) => {
  const { addTab } = useWorkspace();
  const { isSidebarOpen } = useLayout();
    const { theme, toggleTheme } = useTheme();
  

  const handleOpenFile = async () => {
    const result = await performFileOpen();
    if (result) {
      const fileName = result.path.split("\\").pop() || "Untitled";
      const title = fileName.replace(/\.md$/, "");
      addTab(result.path, title, result.content);
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
          onClick={toggleTheme}
          className="p-2 px-2 rounded transition-colors hover:cursor-pointer hover:bg-primary-bg dark:hover:bg-primary-bg-dark text-text-primary dark:text-text-primary-dark"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <MdDarkMode size={18} /> : <MdLightMode size={18} />}
        </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <button
            onClick={handleOpenFile}
            className="p-2 rounded flex items-center space-x-2 w-full justify-center hover:cursor-pointer bg-surface-elevated dark:bg-surface-elevated-dark transition-all"
            title="Open File"
          >
            <span>Open</span>
            <FiFileText size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
