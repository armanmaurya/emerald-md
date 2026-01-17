import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile, remove } from "@tauri-apps/plugin-fs";
import { TabState } from "../context/WorkspaceContext";

export const performFileOpen = async (path?: string) => {
  try {
    let filePath: string;

    if (path) {
      filePath = path;
    } else {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Markdown",
            extensions: ["md", "markdown"],
          },
        ],
      });

      if (!selected) return null;
      filePath = selected as string;
    }

    const content = await readTextFile(filePath);
    return {
      path: filePath,
      content: content,
    };
  } catch (error) {
    console.error("Failed to open file:", error);
    return null;
  }
};

export const performFileSave = async (tab: TabState, updateTab: Function): Promise<boolean> => {
  if (!tab || tab.type !== 'editor') return false;

  const markdown = tab.state.getMarkdown();

  try {
    let filePath = tab.path;

    // If no path exists, trigger the "Save As" dialog
    if (!filePath) {
      filePath = await save({
        title: "Save Markdown File",
        defaultPath: tab.title || "Untitled.md",
        filters: [{ name: "Markdown", extensions: ["md"] }],
      });

      if (!filePath) return false; // User cancelled - return false to indicate save failed

      const fileName = filePath.split("\\").pop() || "Untitled";
      const title = fileName.replace(/\.md$/, "");

      // Update the tab state with the new path and title
      updateTab(tab.id, { path: filePath, title });
    }

    // Write the actual file
    await writeTextFile(filePath, markdown);
    console.log("File saved successfully:", filePath);
    return true; // Save successful
  } catch (error) {
    console.error("Failed to save file:", error);
    return false; // Save failed
  }
};

export const performFileRename = async (oldPath: string, newName: string) => {
  if (!oldPath || !newName) return null;

  try {
    // Get the directory path
    const pathParts = oldPath.split("\\");
    const directory = pathParts.slice(0, -1).join("\\");

    // Create new file path with .md extension if not present
    const newFileName = newName.endsWith(".md") ? newName : `${newName}.md`;
    const newPath = `${directory}\\${newFileName}`;

    // Read the original file content
    const content = await readTextFile(oldPath);

    // Write to new file
    await writeTextFile(newPath, content);

    // Delete the old file
    await remove(oldPath);

    console.log("File renamed successfully:", oldPath, "->", newPath);
    return newPath;
  } catch (error) {
    console.error("Failed to rename file:", error);
    return null;
  }
};
