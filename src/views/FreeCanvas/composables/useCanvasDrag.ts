import { ref } from 'vue'
import type { NodePosition } from '../types'

export function useCanvasDrag() {
  const isDragging = ref(false)
  const dragOffset = ref<NodePosition>({ x: 0, y: 0 })
  const dragNodeId = ref<string | null>(null)

  const startDrag = (nodeId: string, event: MouseEvent, nodePosition: NodePosition) => {
    isDragging.value = true
    dragNodeId.value = nodeId
    dragOffset.value = {
      x: event.clientX - nodePosition.x,
      y: event.clientY - nodePosition.y
    }
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
  }

  const onDrag = (event: MouseEvent) => {
    if (!isDragging.value || !dragNodeId.value) return
    const newPosition: NodePosition = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y
    }
    // 通过自定义事件传递位置更新
    window.dispatchEvent(new CustomEvent('canvas-node-drag', {
      detail: { nodeId: dragNodeId.value, position: newPosition }
    }))
  }

  const stopDrag = () => {
    isDragging.value = false
    dragNodeId.value = null
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }

  return { isDragging, startDrag, stopDrag }
}

export function useCanvasPan(offset: { x: number; y: number }) {
  const isPanning = ref(false)
  const panStart = ref<NodePosition>({ x: 0, y: 0 })
  const panOffsetStart = ref<NodePosition>({ x: 0, y: 0 })

  const startPan = (event: MouseEvent) => {
    // 仅当按下空格或鼠标中键时启用平移
    if (event.button !== 1 && !event.shiftKey) return
    isPanning.value = true
    panStart.value = { x: event.clientX, y: event.clientY }
    panOffsetStart.value = { x: offset.x, y: offset.y }
    document.addEventListener('mousemove', onPan)
    document.addEventListener('mouseup', stopPan)
  }

  const onPan = (event: MouseEvent) => {
    if (!isPanning.value) return
    offset.x = panOffsetStart.value.x + (event.clientX - panStart.value.x)
    offset.y = panOffsetStart.value.y + (event.clientY - panStart.value.y)
  }

  const stopPan = () => {
    isPanning.value = false
    document.removeEventListener('mousemove', onPan)
    document.removeEventListener('mouseup', stopPan)
  }

  return { isPanning, startPan, stopPan }
}