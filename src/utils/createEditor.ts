import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import { CustomLink } from "../editor/extensions/link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

type CreateEditorOptions = {
  content: string;
};

export function createEditor(props: CreateEditorOptions) {
  return new Editor({
    content: props.content,
    contentType: "markdown",
    autofocus: true,
    extensions: [
      StarterKit.configure({
        link: false, // Disable the default link extension from StarterKit
      }),
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'link',
        },
      }),
      Markdown,
      Typography,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
  });
}
