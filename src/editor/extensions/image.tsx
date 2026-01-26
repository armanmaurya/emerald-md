import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageNode from '../components/ImageNode'

export const CustomImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNode)
  },
})
