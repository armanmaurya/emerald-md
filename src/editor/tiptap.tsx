import { EditorContent, Editor } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import { FaCode } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { useWorkspace } from "../hooks/useWorkspace";

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";

interface TiptapProps {
  editor: Editor;
  viewMode?: "source" | "preview";
  onViewModeChange?: (mode: "source" | "preview") => void;
}

const customTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent !important",
    height: "100%",
  },
  // This targets the text inside the editor
  ".cm-content": {
    fontFamily: "Inter, system-ui, sans-serif !important",
  },
  // This targets the line numbers (usually better to keep these mono, 
  // but you can change them too)
  ".cm-gutters": {
    backgroundColor: "transparent !important",
    border: "none",
    fontFamily: "Inter, system-ui, sans-serif !important",
  },
  ".cm-scroller": {
    backgroundColor: "transparent !important",
  }
}, { dark: true });

const Tiptap = ({
  editor,
  viewMode = "preview",
  onViewModeChange,
}: TiptapProps) => {
  const [sourceContent, setSourceContent] = useState("");
  const codeMirrorRef = useRef<any>(null);
  const { activeTabId, updateTab } = useWorkspace();
  const isInitialMount = useRef(true);

  // Reset isInitialMount when editor instance changes
  useEffect(() => {
    isInitialMount.current = true;
  }, [editor]);

  // Sync source content when switching to source mode
  useEffect(() => {
    if (viewMode === "source") {
      const markdown = editor.getMarkdown();
      setSourceContent(markdown);
      // Focus CodeMirror after content is set
      setTimeout(() => codeMirrorRef.current?.view?.focus(), 0);
    }
  }, [viewMode, editor]);

  // Track editor changes and set isDirty to true
  useEffect(() => {
    const handleUpdate = () => {
      // Skip the first update event (from editor initialization)
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (activeTabId) {
        updateTab(activeTabId, { isDirty: true });
      }
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, activeTabId, updateTab]);

  const handleSourceChange = (value: string) => {
    setSourceContent(value);
    // Real-time sync to the Tiptap instance in the background
    editor.commands.setContent(value, {
      contentType: 'markdown',
      emitUpdate: false // Prevent infinite loops
    });
    // Mark tab as dirty when source mode content changes
    if (activeTabId) {
      updateTab(activeTabId, { isDirty: true });
    }
  };

  const handleToggleMode = () => {
    if (viewMode === "preview") {
      // Switching to source mode
      const markdownContent = editor.getMarkdown();
      setSourceContent(markdownContent);
      onViewModeChange?.("source");
    } else {
      // Switching to preview mode - update editor with source content
      // Clear the editor first, then set the markdown content
      editor.commands.clearContent();
      editor.commands.setContent(sourceContent, {
        contentType: "markdown",
        emitUpdate: false,
      });
      onViewModeChange?.("preview");
      setTimeout(() => editor.commands.focus(), 0);
    }
  };

  return (
    <div className="h-full flex flex-col px-3 pt-2">
      {/* Status Bar */}
      <div className="flex fixed right-0 bottom-0 justify-end bg-surface-elevated dark:bg-surface-elevated-dark px-2 py-1 rounded-tl-lg z-10">
        <button
          onClick={handleToggleMode}
          title="Toggle Preview"
          className="text-text-secondary dark:text-text-secondary-dark hover:cursor-pointer hover:text-text-primary dark:hover:text-text-primary-dark"
        >
          {viewMode === "preview" ? (
            <span className="flex items-center gap-2">
              <FaCode size={12} />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FaEye size={12} />
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {viewMode === "preview" ? (
          <div
            className="hover:cursor-text h-full"
            onClick={() => {
              editor?.commands.focus();
            }}
          >
            <EditorContent
              className="prose prose-neutral dark:prose-invert max-w-none editor"
              editor={editor}
              style={{ height: "100%", outline: "none" }}
              autoFocus={true}
            />
          </div>
        ) : (
          <div className="h-full overflow-hidden font-base">
            <CodeMirror
              ref={codeMirrorRef}
              value={sourceContent}
              height="100%"
              className="h-full"
              theme={oneDark}
              extensions={[markdown(), customTheme]}
              onChange={handleSourceChange}
              basicSetup={{
                lineNumbers: false,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
                foldGutter: false,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Tiptap;
