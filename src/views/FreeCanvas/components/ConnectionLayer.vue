<template>
  <svg class="connection-layer" :width="canvasWidth" :height="canvasHeight" style="position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible;">
    <defs>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#94a3b8;stop-opacity:0.8" />
        <stop offset="50%" style="stop-color:#6366f1;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#94a3b8;stop-opacity:0.8" />
      </linearGradient>
    </defs>
    
    <!-- 连接线 -->
    <path 
      v-for="(conn, index) in connectionsArray" 
      :key="conn.id || index"
      :d="getConnectionPath(conn)"
      stroke="#6366f1"
      stroke-width="3"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="['connection-line', { 'is-active': conn.isActive }]"
      style="filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.25));"
    />
    
    <!-- 起点标记 -->
    <circle 
      v-for="(conn, index) in connectionsArray" 
      :key="'start-' + (conn.id || index)"
      :cx="getConnectionStart(conn).x"
      :cy="getConnectionStart(conn).y"
      r="6"
      fill="#6366f1"
      stroke="white"
      stroke-width="2"
    />
    
    <!-- 终点标记 -->
    <circle 
      v-for="(conn, index) in connectionsArray" 
      :key="'end-' + (conn.id || index)"
      :cx="getConnectionEnd(conn).x"
      :cy="getConnectionEnd(conn).y"
      r="6"
      fill="#6366f1"
      stroke="white"
      stroke-width="2"
    />
    
    <!-- 终点箭头 -->
    <polygon 
      v-for="(conn, index) in connectionsArray" 
      :key="'arrow-' + (conn.id || index)"
      :points="getArrowPoints(conn)"
      fill="#6366f1"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasNode, NodeConnection } from '../types'

const props = defineProps<{
  connections?: NodeConnection[] | { value: NodeConnection[] }
  nodes?: CanvasNode[] | { value: CanvasNode[] }
  scale?: number
  offset?: { x: number; y: number }
}>()

// 画布尺寸
const canvasWidth = ref(1920)
const canvasHeight = ref(1080)

// 安全解包 ref 或数组
const unrefValue = <T>(val: T | { value: T } | undefined): T | undefined => {
  if (!val) return undefined
  if ('value' in val) return (val as any).value
  return val
}

// 安全获取数组
const nodesArray = computed<CanvasNode[]>(() => {
  const nodes = unrefValue(props.nodes)
  return Array.isArray(nodes) ? nodes : []
})

const connectionsArray = computed<NodeConnection[]>(() => {
  const connections = unrefValue(props.connections)
  return Array.isArray(connections) ? connections : []
})

// 获取连接线起点（源节点右侧中心）
const getConnectionStart = (conn: NodeConnection) => {
  const sourceNode = nodesArray.value.find(n => n.id === conn.sourceId)
  if (!sourceNode) return { x: 0, y: 0 }
  return {
    x: sourceNode.position.x + sourceNode.size.width,
    y: sourceNode.position.y + sourceNode.size.height / 2
  }
}

// 获取连接线终点（目标节点左侧中心）
const getConnectionEnd = (conn: NodeConnection) => {
  const targetNode = nodesArray.value.find(n => n.id === conn.targetId)
  if (!targetNode) return { x: 0, y: 0 }
  return {
    x: targetNode.position.x,
    y: targetNode.position.y + targetNode.size.height / 2
  }
}

// 生成贝塞尔曲线路径
const getConnectionPath = (conn: NodeConnection) => {
  const start = getConnectionStart(conn)
  const end = getConnectionEnd(conn)
  
  const dx = end.x - start.x
  const dy = end.y - start.y
  
  // 控制点偏移（产生弯曲效果）
  const controlOffset = Math.max(Math.abs(dx) * 0.5, 80)
  
  const cx1 = start.x + controlOffset
  const cy1 = start.y
  const cx2 = end.x - controlOffset
  const cy2 = end.y
  
  // 贝塞尔曲线路径
  return `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`
}

// 生成终点箭头
const getArrowPoints = (conn: NodeConnection) => {
  const end = getConnectionEnd(conn)
  const size = 10
  
  // 指向左侧的箭头
  return `${end.x - size} ${end.y},${end.x} ${end.y - size / 2},${end.x} ${end.y + size / 2}`
}

// 调试输出
console.log('ConnectionLayer - Connections:', connectionsArray.value)
console.log('ConnectionLayer - Nodes:', nodesArray.value)
</script>

<style scoped>
.connection-layer {
  overflow: visible;
  z-index: 1;
}

.connection-line {
  pointer-events: stroke;
  cursor: pointer;
  transition: all 0.2s ease;
}

.connection-line:hover {
  stroke-width: 4;
  stroke: #4f46e5;
}

.connection-line.is-active {
  stroke: #4f46e5;
  stroke-width: 4;
}
</style>