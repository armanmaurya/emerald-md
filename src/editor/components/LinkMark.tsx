import { useState, useRef, useEffect } from "react";
import { MarkViewContent, MarkViewRendererProps } from "@tiptap/react";
import { motion, AnimatePresence } from "motion/react";
import { FiExternalLink, FiEdit2 } from "react-icons/fi";
import { openUrl } from "@tauri-apps/plugin-opener";

interface LinkMarkProps extends MarkViewRendererProps {
  HTMLAttributes: MarkViewRendererProps["HTMLAttributes"] & {
    href?: string;
  };
}

export default function LinkMark(props: LinkMarkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(props.HTMLAttributes.href || "");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use setTimeout to ensure the input is rendered and visible
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing]);

  // Calculate floating position with viewport bounds checking
  useEffect(() => {
    if (!isOpen || !containerRef.current || !popoverRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let top = rect.bottom + 8; // 8px gap below the link
    let left = rect.left;

    // Viewport bounds checking
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if popover goes beyond viewport
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 8;
    }
    if (left < 0) {
      left = 8;
    }

    // Adjust vertical position if popover goes beyond viewport
    if (top + popoverRect.height > viewportHeight) {
      top = rect.top - popoverRect.height - 8; // Show above instead
    }

    setPosition({
      top: rect.top + window.scrollY + rect.height + 8,
      left: rect.left + window.scrollX,
    });
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleVisitLink = async () => {
    const href = props.HTMLAttributes.href;
    if (href) {
      await openUrl(href);
    }
  };

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      if (!isEditing) {
        setIsOpen(false);
      }
    }, 150);
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  return (
    <span
      ref={containerRef}
      className="relative inline"
      onMouseEnter={() => {
        cancelClose();
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        scheduleClose();
      }}
    >
      {/* Link text with underline styling */}
      <span className="text-slate-700 dark:text-slate-300 underline rounded px-0.5 transition-colors">
        <MarkViewContent />
      </span>

      {/* Floating popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 bg-surface-elevated border border-surface dark:border-surface-dark dark:bg-surface-elevated-dark rounded-md shadow-md p-2 min-w-max"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            contentEditable={false}
            onMouseEnter={() => {
              cancelClose();
              setIsOpen(true);
            }}
            onMouseLeave={() => {
              scheduleClose();
            }}
          >
            {!isEditing ? (
              // View mode
              <div className="space-y-1.5">
                {/* URL Display */}
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">
                    {props.HTMLAttributes.href}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={handleVisitLink}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-primary-bg dark:hover:bg-primary-bg-dark transition-colors"
                    contentEditable={false}
                  >
                    <FiExternalLink className="w-3 h-3" />
                    Visit
                  </button>
                  <button
                    onClick={() => {
                      setEditUrl(props.HTMLAttributes.href || "");
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-primary-bg dark:hover:bg-primary-bg-dark transition-colors"
                    contentEditable={false}
                  >
                    <FiEdit2 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              // Edit mode
              <div className="space-y-2 w-80">
                {/* URL Input */}
                <div>
                  <label className="block text-xs font-medium mb-1">URL</label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded"
                    placeholder="https://example.com"
                    contentEditable={false}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") {
                        e.preventDefault();
                        props.updateAttributes({ href: editUrl });
                        setIsOpen(false);
                        setIsEditing(false);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        setIsEditing(false);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
