import { motion, AnimatePresence } from "motion/react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
}: ConfirmDialogProps) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const discardButtonRef = useRef<HTMLButtonElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const buttonRefs = [cancelButtonRef, discardButtonRef, saveButtonRef];
  const currentFocusIndex = useRef(0);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isSaving) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, isSaving, onCancel]);

  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button by default when dialog opens
      currentFocusIndex.current = 0;
      cancelButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        currentFocusIndex.current = (currentFocusIndex.current + 1) % buttonRefs.length;
        buttonRefs[currentFocusIndex.current].current?.focus();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        currentFocusIndex.current = (currentFocusIndex.current - 1 + buttonRefs.length) % buttonRefs.length;
        buttonRefs[currentFocusIndex.current].current?.focus();
      }
    };

    document.addEventListener("keydown", handleArrowKeys);
    return () => document.removeEventListener("keydown", handleArrowKeys);
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: 10 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-surface-elevated dark:bg-surface-elevated-dark rounded-xl shadow-2xl dark:shadow-2xl p-6 border border-surface-border/50 dark:border-surface-border-dark/50">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-text-primary dark:text-text-primary-dark leading-tight">
                    {title}
                  </h2>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  ref={cancelButtonRef}
                  onClick={onCancel}
                  disabled={isSaving}
                  className="px-4 py-2.5 hover:cursor-pointer rounded-lg bg-transparent hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Cancel
                </button>
                <button
                  ref={discardButtonRef}
                  onClick={onDiscard}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-lg hover:cursor-pointer bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Discard
                </button>
                <button
                  ref={saveButtonRef}
                  onClick={onSave}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-lg hover:cursor-pointer bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {isSaving ? (
                    <>
                     <div>
                        <AiOutlineLoading3Quarters className="animate-spin" />
                     </div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
