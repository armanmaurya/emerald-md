import { CgClose } from "react-icons/cg";
import { GoDotFill } from "react-icons/go";
import { IoSettings  } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import AutowidthInput from "react-autowidth-input";
import { TabType } from "../../context/WorkspaceContext";
import { IoLogoMarkdown } from "react-icons/io";

interface TabProps {
  title: string;
  isActive: boolean;
  isDirty?: boolean;
  tabType: TabType;
  onActivate: () => void;
  onClose: () => void;
  onRename?: (newName: string) => void;
  isRenaming?: boolean;
  onCancelRename?: () => void;
}

const Tab = ({ title, isActive, isDirty = false, tabType, onActivate, onClose, onRename, isRenaming: externalIsRenaming, onCancelRename }: TabProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [inputValue, setInputValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const canRename = tabType === 'editor';

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (externalIsRenaming && canRename) {
      setIsRenaming(true);
      setInputValue(title);
    }
  }, [externalIsRenaming, title, canRename]);

  const handleDoubleClick = () => {
    if (!canRename) return;
    setIsRenaming(true);
    setInputValue(title);
  };

  const handleRename = () => {
    if (inputValue.trim() && inputValue !== title) {
      onRename?.(inputValue.trim());
    } else {
      onCancelRename?.();
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setIsRenaming(false);
      onCancelRename?.();
    }
  };

  const getTabIcon = () => {
    switch (tabType) {
      case 'settings':
        return <IoSettings size={16} />;
      case 'dashboard':
        return <MdDashboard size={14} />;
      case 'editor':
      default:
        return <IoLogoMarkdown size={18} />;
    }
  };

  return (
    <div
      onClick={onActivate}
      className={`p-2 h-full flex items-center space-x-2 px-2 hover:cursor-pointer text-text-primary dark:text-text-primary-dark rounded-t-lg whitespace-nowrap ${
        isActive ? "bg-surface-elevated dark:bg-primary-bg-dark" : "hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
      }`}
    >
      {getTabIcon()}
      {isRenaming ? (
        <AutowidthInput
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleRename}
          onClick={(e) => e.stopPropagation()}
          className="text-text-primary dark:text-text-primary-dark bg-transparent"
        />
      ) : (
        <span onDoubleClick={handleDoubleClick}>{title}</span>
      )}
      {isDirty && tabType === 'editor' ? (
        <GoDotFill className="text-accent" size={10} />
      ) : (
        <CgClose
          size={12}
          className="hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default Tab;