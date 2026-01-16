import { getCurrentWindow } from "@tauri-apps/api/window";
import { FiMaximize } from "react-icons/fi";
import { CgClose } from "react-icons/cg";
import { useLayout } from "../../context/LayoutContext";

import { FaRegWindowRestore } from "react-icons/fa";
import { useState, useEffect } from "react";
import { TbLayoutSidebar } from "react-icons/tb";
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { FaRegWindowMinimize } from "react-icons/fa";

type TitleBarProps = {
  children?: React.ReactNode;
  className?: string;
};

const TitleBar = (props: TitleBarProps) => {
  const appWindow = getCurrentWindow();
  const { toggleSidebar, isSidebarOpen } = useLayout();
  const [isMaximized, setIsMaximized] = useState(true);

  useEffect(() => {
    appWindow.isMaximized().then((maximized) => {
      setIsMaximized(maximized);
    });
  }, [appWindow]);
  return (
    <div
      data-tauri-drag-region
      className={`flex z-50 justify-between items-center transition-all duration-300 fixed top-0 right-0 p-0 m-0 bg-surface dark:bg-surface-dark ${
        isSidebarOpen ? "left-64" : "left-0"
      } ${props.className || ""}`}
    >
      <button
        onClick={toggleSidebar}
        className="z-50 rounded px-2 hover:cursor-pointer sticky left-0 bg-surface dark:bg-surface-dark transition-colors text-text-primary dark:text-text-primary-dark"
      >
        {isSidebarOpen ? (
          <TbLayoutSidebarFilled size={20} />
        ) : (
          <TbLayoutSidebar size={20} />
        )}
      </button>
      <div className="overflow-x-auto">
        {props.children}
      </div>
      <div data-tauri-drag-region className="min-w-14 flex-1"/>
      <div className="flex sticky right-0 top-0 bg-surface dark:bg-surface-dark">
        <button
          onClick={() => appWindow.minimize()}
          className="p-2 h-10 px-4 rounded transition-colors hover:cursor-pointer hover:bg-primary-bg dark:hover:bg-primary-bg-dark text-text-primary dark:text-text-primary-dark"
        >
          <FaRegWindowMinimize size={12}/>
        </button>
        <button
          onClick={() => {
            appWindow.toggleMaximize();
            setIsMaximized(!isMaximized);
          }}
          className="p-2 px-4 rounded transition-colors hover:cursor-pointer hover:bg-primary-bg dark:hover:bg-primary-bg-dark text-text-primary dark:text-text-primary-dark"
        >
          {isMaximized ? <FaRegWindowRestore size={12} /> : <FiMaximize size={15} />}
        </button>
        <button
          onClick={() => appWindow.close()}
          className="p-2 px-4 rounded transition-colors hover:cursor-pointer hover:bg-red-500 hover:text-white active:bg-red-600 text-text-primary dark:text-text-primary-dark"
        >
          <CgClose size={18} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
