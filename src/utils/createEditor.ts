import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Typography from "@tiptap/extension-typography";

type CreateEditorOptions = {
  content: string;
};

export function createEditor(props: CreateEditorOptions) {
  return new Editor({
    content: props.content,
    contentType: "markdown",
    autofocus: true,
    extensions: [StarterKit, Markdown, Typography],
  });
}
