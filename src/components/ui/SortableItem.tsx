import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

type SortableItemProps = {
  id: string;
  children: ReactNode;
  className?: string;
  onActivate?: () => void;
  tabRef?: (el: HTMLDivElement | null) => void;
};

const SortableItem = ({
  id,
  children,
  className = "",
  onActivate,
  tabRef,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Filter out space and enter from keyboard listeners
  const filteredListeners = {
    ...listeners,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        return;
      }
      listeners?.onKeyDown?.(e as any);
    },
  };

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        tabRef?.(el);
      }}
      style={style}
      {...attributes}
      {...filteredListeners}
      onClick={onActivate}
      className={className}
    >
      {children}
    </div>
  );
};

export default SortableItem;
