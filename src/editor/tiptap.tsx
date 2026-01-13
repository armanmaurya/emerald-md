import { EditorContent, Editor } from "@tiptap/react";

interface TiptapProps {
  editor: Editor;
}

const Tiptap = ({ editor }: TiptapProps) => {
  return (
    <div
      className="hover:cursor-text h-full"
      onClick={() => {
        editor?.commands.focus();
      }}
    >
      <EditorContent
        placeholder="Start writing....."
        className="prose prose-neutral dark:prose-invert max-w-none editor"
        editor={editor}
        style={{ height: "100%", outline: "none" }}
        autoFocus={true}
      />
    </div>
  );
};

export default Tiptap;
