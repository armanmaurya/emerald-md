import { useToast } from "../../hooks/useToast";
import {
  MdClose,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdWarning,
} from "react-icons/md";
import { motion, AnimatePresence } from "motion/react";

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: string) => {
    const baseStyles =
      "flex items-center gap-3 p-4 rounded-lg shadow-lg text-white min-w-72";

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-500`;
      case "error":
        return `${baseStyles} bg-red-500`;
      case "warning":
        return `${baseStyles} bg-yellow-500`;
      case "info":
      default:
        return `${baseStyles} bg-blue-500`;
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success":
        return <MdCheckCircle size={20} />;
      case "error":
        return <MdError size={20} />;
      case "warning":
        return <MdWarning size={20} />;
      case "info":
      default:
        return <MdInfo size={20} />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 400, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
            layout
            className={`${getToastStyles(toast.type)} pointer-events-auto`}
          >
            <motion.div
              className="shrink-0"
              animate={{ rotate: 0 }}
              initial={{ rotate: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {getToastIcon(toast.type)}
            </motion.div>
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <motion.button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 hover:opacity-75 transition-opacity"
              aria-label="Close"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdClose size={18} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
