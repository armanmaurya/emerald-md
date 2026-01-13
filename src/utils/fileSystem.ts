import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

export const performFileSave = async (tab: any, updateTab: Function) => {
  if (!tab) return;

  const markdown = tab.state.getMarkdown();

  try {
    let filePath = tab.path;

    // If no path exists, trigger the "Save As" dialog
    if (!filePath) {
      filePath = await save({
        filters: [{ name: "Markdown", extensions: ["md"] }],
      });

      if (!filePath) return; // User cancelled

      const fileName = filePath.split("\\").pop() || "Untitled";
      const title = fileName.replace(/\.md$/, "");
      
      // Update the tab state with the new path and title
      updateTab(tab.id, { path: filePath, title });
    }

    // Write the actual file
    await writeTextFile(filePath, markdown);
    console.log("File saved successfully:", filePath);
  } catch (error) {
    console.error("Failed to save file:", error);
  }
};