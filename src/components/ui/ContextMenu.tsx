import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isDanger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
}

const ContextMenu = ({ items, x, y, isOpen, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Calculate menu position to prevent overflow
  useEffect(() => {
    if (!menuRef.current || !isOpen) return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust X position if menu goes off-screen
    if (x + rect.width + padding > viewportWidth) {
      adjustedX = Math.max(padding, viewportWidth - rect.width - padding);
    }

    // Adjust Y position if menu goes off-screen
    if (y + rect.height + padding > viewportHeight) {
      adjustedY = Math.max(padding, viewportHeight - rect.height - padding);
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y, isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedItem = items[selectedIndex];
        if (selectedItem && !selectedItem.disabled) {
          selectedItem.onClick();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Reset selected index when menu opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="fixed bg-surface-elevated dark:bg-surface-elevated-dark shadow-lg rounded-lg overflow-hidden z-50 min-w-50"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          initial={{ opacity: 0, scale: 1.02, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    onClose();
                  }
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                  selectedIndex === index
                    ? "bg-primary-bg dark:bg-primary-bg-dark"
                    : "hover:bg-primary-bg dark:hover:bg-primary-bg-dark"
                } ${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  item.isDanger
                    ? "text-red-600 dark:text-red-400"
                    : "text-text-primary dark:text-text-primary-dark"
                }`}
                disabled={item.disabled}
              >
                {item.icon && <span className="flex items-center">{item.icon}</span>}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
