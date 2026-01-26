import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { useWorkspace } from '../../hooks/useWorkspace'
import { dirname, resolve } from '@tauri-apps/api/path'
import { convertFileSrc } from '@tauri-apps/api/core'

export default function ImageNode(props: NodeViewProps) {
  const { tabs, activeTabId } = useWorkspace()
  const [resolvedSrc, setResolvedSrc] = useState<string>('')

  useEffect(() => {
    const resolveSrc = async () => {
      const src = props.node.attrs.src
      if (!src) return

      // Check if it's a relative path (not http://, https://, data:, etc.)
      const isRelative = !src.match(/^([a-zA-Z]+:|data:)/)

      if (isRelative) {
        // Get the current tab to find the active file path
        const activeTab = tabs.find(tab => tab.id === activeTabId)

        if (activeTab && activeTab.type === 'editor' && activeTab.path) {
          try {
            // Get the directory of the current file
            const currentDir = await dirname(activeTab.path)
            // Resolve the relative path to an absolute path
            const absolutePath = await resolve(currentDir, src)
            // Convert to a Tauri asset URL
            const assetUrl = convertFileSrc(absolutePath)
            setResolvedSrc(assetUrl)
          } catch (error) {
            console.error('Failed to resolve relative image path:', error)
            setResolvedSrc(src)
          }
        } else {
          setResolvedSrc(src)
        }
      } else {
        setResolvedSrc(src)
      }
    }

    resolveSrc()
  }, [props.node.attrs.src, tabs, activeTabId])

  return (
    <NodeViewWrapper className="image-node">
      <img
        src={resolvedSrc}
        alt={props.node.attrs.alt || ''}
        title={props.node.attrs.title || ''}
        className="max-w-full h-auto rounded"
      />
    </NodeViewWrapper>
  )
}
