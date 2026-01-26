import Link from '@tiptap/extension-link'
import { ReactMarkViewRenderer } from '@tiptap/react'
import { InputRule, PasteRule } from '@tiptap/core'
import LinkMark from '../components/LinkMark'

/**
 * Matches links in markdown format: [text](url) while pasting
 */
export const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g

/**
 * Matches links in markdown format: [text](url) as input
 */
export const markdownLinkInputRegex = /\[([^\]]+)\]\(([^)]+)\)$/

export const CustomLink = Link.extend({
  addMarkView() {
    return ReactMarkViewRenderer(LinkMark)
  },

  addInputRules() {
    return [
      new InputRule({
        find: markdownLinkInputRegex,
        handler: ({ state, range, match }) => {
          const [, text, href] = match
          const { tr } = state
          
          if (text && href) {
            const linkMark = this.type.create({ href })
            const textNode = state.schema.text(text, [linkMark])
            tr.replaceWith(range.from, range.to, textNode)
          }
        },
      }),
    ]
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: markdownLinkRegex,
        handler: ({ state, range, match }) => {
          const [, text, href] = match
          const { tr } = state
          
          if (text && href) {
            const linkMark = this.type.create({ href })
            const textNode = state.schema.text(text, [linkMark])
            tr.replaceWith(range.from, range.to, textNode)
          }
        },
      }),
    ]
  },
})
