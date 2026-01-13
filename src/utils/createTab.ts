import { v4 as uuid4 } from "uuid";
import { TabState } from "../context/TabEditorContext";
import { createEditor } from "./createEditor";

export function createTab(filePath: string, content: string): TabState {
  return {
    id: uuid4(),
    path: filePath,
    title: filePath.split("\\").pop() || "Untitled",
    state: createEditor({ content }),
    isDirty: false,
  };
}
