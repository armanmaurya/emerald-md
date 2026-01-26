import Link from "@tiptap/extension-link";
import { ReactMarkViewRenderer } from "@tiptap/react";
import { InputRule, PasteRule } from "@tiptap/core";
import LinkMark from "../components/LinkMark";

/**
 * Matches links in markdown format: [text](url) while pasting
 */
export const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Matches links in markdown format: [text](url) as input
 */
export const markdownLinkInputRegex = /\[([^\]]+)\]\(([^)]+)\)$/;

export const CustomLink = Link.extend({
  addMarkView() {
    return ReactMarkViewRenderer(LinkMark);
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Space": ({ editor }) => {
        // Only trigger if we are currently inside a link
        if (editor.isActive("link")) {
          return editor
            .chain()
            .unsetMark("link") // 2. Clear the link mark at the new position
            .insertContent(" ") // 1. Insert the space character
            .focus() // 3. Keep cursor active
            .run();
        }
        return false;
      },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: markdownLinkInputRegex,
        handler: ({ state, range, match }) => {
          const [, text, href] = match;
          const { tr } = state;

          if (text && href) {
            const linkMark = this.type.create({ href });
            const textNode = state.schema.text(text, [linkMark]);
            tr.replaceWith(range.from, range.to, textNode);
            // Add a space after the link to exit it automatically
            tr.insertText(" ");
          }
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: markdownLinkRegex,
        handler: ({ state, range, match }) => {
          const [, text, href] = match;
          const { tr } = state;

          if (text && href) {
            const linkMark = this.type.create({ href });
            const textNode = state.schema.text(text, [linkMark]);
            tr.replaceWith(range.from, range.to, textNode);
          }
        },
      }),
    ];
  },
});
