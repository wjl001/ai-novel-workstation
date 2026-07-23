// 3D 导演台预览渲染引擎 - 基于 Canvas2D 的轻量 3D 渲染
// 用于在节点卡片中显示 3D 场景的透视预览

import type {
  CameraConfig,
  LightConfig,
  MaterialConfig,
  EnvironmentConfig,
  Scene3DObject,
  ShotType,
  LightDirection
} from '../types'

/** 渲染上下文 */
export interface RenderContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  camera: CameraConfig
  lights: LightConfig[]
  materials: MaterialConfig[]
  environment: EnvironmentConfig
  objects: Scene3DObject[]
}

/** 3D 向量 */
export interface Vec3 {
  x: number
  y: number
  z: number
}

/** 2D 投影点 */
export interface ProjectedPoint {
  sx: number
  sy: number
  depth: number
}

// 默认相机配置
const DEFAULT_CAMERA: CameraConfig = {
  focalLength: 50,
  cameraHeight: 1.5,
  motion: 'static',
  shotType: 'medium',
  fov: 60,
  position: { x: 0, y: 1.5, z: 5 },
  target: { x: 0, y: 1, z: 0 },
  nearClip: 0.1,
  farClip: 100
}

// 默认灯光配置
const DEFAULT_LIGHTS: LightConfig[] = [
  {
    id: 'light_key',
    name: '主光',
    type: 'key',
    direction: 'front',
    color: '#ffffff',
    intensity: 0.8,
    temperature: 5600,
    softness: 0.5,
    enabled: true
  },
  {
    id: 'light_fill',
    name: '辅光',
    type: 'fill',
    direction: 'left',
    color: '#aaccff',
    intensity: 0.4,
    temperature: 4000,
    softness: 0.8,
    enabled: true
  },
  {
    id: 'light_rim',
    name: '轮廓光',
    type: 'rim',
    direction: 'back',
    color: '#ffccaa',
    intensity: 0.3,
    temperature: 3200,
    softness: 0.6,
    enabled: true
  },
  {
    id: 'light_ambient',
    name: '环境光',
    type: 'ambient',
    direction: 'top',
    color: '#8888aa',
    intensity: 0.2,
    temperature: 6500,
    softness: 1.0,
    enabled: true
  }
]

// 默认材质
const DEFAULT_MATERIALS: MaterialConfig[] = [
  {
    id: 'mat_default',
    name: '默认材质',
    color: '#888888',
    roughness: 0.5,
    metalness: 0.0,
    emissive: '#000000',
    emissiveIntensity: 0,
    bumpScale: 0
  }
]

// 默认环境
const DEFAULT_ENVIRONMENT: EnvironmentConfig = {
  skyType: 'gradient',
  skyTopColor: '#1a1a2e',
  skyBottomColor: '#16213e',
  exposure: 1.0,
  fogEnabled: false,
  fogColor: '#888888',
  fogNear: 20,
  fogFar: 80
}

// 默认场景对象
const DEFAULT_OBJECTS: Scene3DObject[] = [
  {
    id: 'floor',
    name: '地面',
    type: 'mesh',
    visible: true,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 10, y: 0.05, z: 10 },
    materialId: 'mat_floor'
  },
  {
    id: 'cube',
    name: '参考立方体',
    type: 'prop',
    visible: true,
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    materialId: 'mat_default'
  }
]

// ============= 工具函数 =============

/** 向量加法 */
function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

/** 向量减法 */
function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

/** 向量数乘 */
function vec3Scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

/** 向量点积 */
function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

/** 向量叉积 */
function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }
}

/** 向量归一化 */
function vec3Normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (len === 0) return { x: 0, y: 0, z: 0 }
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

/** 颜色十六进制 → RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 128, g: 128, b: 128 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

/** 颜色混合 */
function mixColor(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number): string {
  const r = Math.round(c1.r * (1 - t) + c2.r * t)
  const g = Math.round(c1.g * (1 - t) + c2.g * t)
  const b = Math.round(c1.b * (1 - t) + c2.b * t)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 根据景别设置相机 FOV
 */
function shotTypeToFov(shotType: ShotType): number {
  const fovMap: Record<string, number> = {
    'extreme-close-up': 90,
    'close-up': 70,
    'medium-close': 60,
    'medium': 50,
    'medium-full': 40,
    'full': 30,
    'wide': 25,
    'extreme-wide': 15
  }
  return fovMap[shotType] || 50
}

/**
 * 根据灯光方向计算灯光方向向量
 */
function lightDirectionVector(dir: LightDirection): Vec3 {
  const dirMap: Record<LightDirection, Vec3> = {
    'top': { x: 0, y: -1, z: 0 },
    'bottom': { x: 0, y: 1, z: 0 },
    'left': { x: 1, y: 0, z: 0 },
    'right': { x: -1, y: 0, z: 0 },
    'back': { x: 0, y: 0, z: 1 },
    'side': { x: 0.7, y: 0, z: 0.7 },
    'front': { x: 0, y: 0, z: -1 }
  }
  return vec3Normalize(dirMap[dir] || { x: 0, y: 0, z: -1 })
}

// ============= 3D 变换 =============

/** 绕 Y 轴旋转 */
function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle)
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c }
}

/** 绕 X 轴旋转 */
function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle), s = Math.sin(angle)
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c }
}

/**
 * 将世界坐标投影到屏幕坐标
 */
function projectPoint(worldPos: Vec3, camera: CameraConfig, width: number, height: number): ProjectedPoint | null {
  const fov = camera.fov
  const aspect = width / height
  const focal = width / (2 * Math.tan((fov * Math.PI) / 360))

  // 相机到目标的向量
  const camDir = vec3Normalize(vec3Sub(camera.target, camera.position))
  const camRight = vec3Normalize(vec3Cross(camDir, { x: 0, y: 1, z: 0 }))
  const camUp = vec3Cross(camRight, camDir)

  // 物体相对于相机的位置
  const relPos = vec3Sub(worldPos, camera.position)

  // 投影到相机空间
  const z = vec3Dot(relPos, camDir)
  if (z < camera.nearClip) return null

  const x = vec3Dot(relPos, camRight)
  const y = -vec3Dot(relPos, camUp)

  // 透视投影
  const sx = (x / z) * focal + width / 2
  const sy = (y / z) * focal + height / 2

  return { sx, sy, depth: z }
}

// ============= 3D 几何体 =============

/** 立方体顶点（相对于中心） */
const CUBE_VERTICES: Vec3[] = [
  { x: -0.5, y: -0.5, z: -0.5 },  // 0
  { x: 0.5, y: -0.5, z: -0.5 },   // 1
  { x: 0.5, y: 0.5, z: -0.5 },    // 2
  { x: -0.5, y: 0.5, z: -0.5 },   // 3
  { x: -0.5, y: -0.5, z: 0.5 },   // 4
  { x: 0.5, y: -0.5, z: 0.5 },    // 5
  { x: 0.5, y: 0.5, z: 0.5 },     // 6
  { x: -0.5, y: 0.5, z: 0.5 }     // 7
]

/** 立方体面（顶点对） */
const CUBE_FACES: number[][] = [
  [0, 1, 2, 3],  // 前
  [5, 4, 7, 6],  // 后
  [4, 0, 3, 7],  // 左
  [1, 5, 6, 2],  // 右
  [3, 2, 6, 7],  // 上
  [4, 5, 1, 0]   // 下
]

/** 立方体面法线 */
const CUBE_FACE_NORMALS: Vec3[] = [
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 0, z: 1 },
  { x: -1, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 }
]

/** 地面网格顶点 */
const GRID_SIZE = 5
const GRID_SPACING = 1

/**
 * 获取物体的世界坐标顶点
 */
function getObjectVertices(obj: Scene3DObject): Vec3[] {
  return CUBE_VERTICES.map(v => {
    let world = { x: v.x * obj.scale.x, y: v.y * obj.scale.y, z: v.z * obj.scale.z }
    // 应用旋转
    if (obj.rotation.y !== 0) world = rotateY(world, obj.rotation.y)
    if (obj.rotation.x !== 0) world = rotateX(world, obj.rotation.x)
    if (obj.rotation.z !== 0) {
      const c = Math.cos(obj.rotation.z), s = Math.sin(obj.rotation.z)
      world = { x: world.x, y: world.y * c - world.z * s, z: world.y * s + world.z * c }
    }
    return vec3Add(world, obj.position)
  })
}

// ============= 渲染函数 =============

/**
 * 渲染 3D 预览
 */
export function render3DPreview(
  canvas: HTMLCanvasElement,
  camera: CameraConfig = DEFAULT_CAMERA,
  lights: LightConfig[] = DEFAULT_LIGHTS,
  materials: MaterialConfig[] = DEFAULT_MATERIALS,
  environment: EnvironmentConfig = DEFAULT_ENVIRONMENT,
  objects: Scene3DObject[] = DEFAULT_OBJECTS
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const dpr = window.devicePixelRatio || 1

  // 设置实际渲染尺寸
  const cssWidth = canvas.clientWidth || width
  const cssHeight = canvas.clientHeight || height
  canvas.width = Math.max(1, Math.floor(cssWidth * dpr))
  canvas.height = Math.max(1, Math.floor(cssHeight * dpr))
  ctx.scale(dpr, dpr)

  const w = cssWidth
  const h = cssHeight

  // ============= 绘制天空背景 =============
  const skyTop = hexToRgb(environment.skyTopColor)
  const skyBot = hexToRgb(environment.skyBottomColor)
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, `rgb(${skyTop.r}, ${skyTop.g}, ${skyTop.b})`)
  gradient.addColorStop(1, `rgb(${skyBot.r}, ${skyBot.g}, ${skyBot.b})`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // ============= 绘制地面网格 =============
  drawGroundGrid(ctx, camera, w, h, environment)

  // ============= 绘制场景对象 =============
  objects.forEach(obj => {
    if (!obj.visible) return
    drawObject(ctx, obj, camera, lights, materials, w, h)
  })

  // ============= 绘制相机指示器 =============
  drawCameraIndicator(ctx, camera, w, h)

  // ============= 绘制 HUD 信息 =============
  drawHUD(ctx, camera, lights, w, h)
}

/**
 * 绘制地面网格
 */
function drawGroundGrid(ctx: CanvasRenderingContext2D, camera: CameraConfig, w: number, h: number, env: EnvironmentConfig): void {
  ctx.save()
  ctx.lineWidth = 0.5
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'

  // 绘制网格线（通过投影顶点）
  for (let i = -GRID_SIZE; i <= GRID_SIZE; i++) {
    // X 方向线
    const points: ProjectedPoint[] = []
    for (let j = -GRID_SIZE; j <= GRID_SIZE; j++) {
      const p = projectPoint({ x: i * GRID_SPACING, y: 0, z: j * GRID_SPACING }, camera, w, h)
      if (p) points.push(p)
    }
    if (points.length > 1) {
      ctx.beginPath()
      points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.sx, p.sy)
        else ctx.lineTo(p.sx, p.sy)
      })
      ctx.stroke()
    }

    // Z 方向线
    const pointsZ: ProjectedPoint[] = []
    for (let j = -GRID_SIZE; j <= GRID_SIZE; j++) {
      const p = projectPoint({ x: j * GRID_SPACING, y: 0, z: i * GRID_SPACING }, camera, w, h)
      if (p) pointsZ.push(p)
    }
    if (pointsZ.length > 1) {
      ctx.beginPath()
      pointsZ.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.sx, p.sy)
        else ctx.lineTo(p.sx, p.sy)
      })
      ctx.stroke()
    }
  }

  // 中心轴
  const axisColor = { x: '#ff4444', y: '#44ff44', z: '#4444ff' }
  const axisPoints: { start: Vec3; end: Vec3; color: string }[] = [
    { start: { x: 0, y: 0, z: 0 }, end: { x: 2, y: 0, z: 0 }, color: axisColor.x },
    { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 2, z: 0 }, color: axisColor.y },
    { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: 2 }, color: axisColor.z }
  ]

  ctx.lineWidth = 1.5
  axisPoints.forEach(axis => {
    const p1 = projectPoint(axis.start, camera, w, h)
    const p2 = projectPoint(axis.end, camera, w, h)
    if (p1 && p2) {
      ctx.strokeStyle = axis.color
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.moveTo(p1.sx, p1.sy)
      ctx.lineTo(p2.sx, p2.sy)
      ctx.stroke()
    }
  })
  ctx.globalAlpha = 1

  ctx.restore()
}

/**
 * 绘制单个对象
 */
function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: Scene3DObject,
  camera: CameraConfig,
  lights: LightConfig[],
  materials: MaterialConfig[],
  w: number,
  h: number
): void {
  const vertices = getObjectVertices(obj)
  const material = materials.find(m => m.id === obj.materialId) || materials[0]

  // 投影所有顶点
  const projected: (ProjectedPoint | null)[] = vertices.map(v => projectPoint(v, camera, w, h))
  if (projected.some(p => p === null)) return

  // 绘制每个面
  CUBE_FACES.forEach((faceIndices, faceIdx) => {
    const faceProjected = faceIndices.map(i => projected[i]) as ProjectedPoint[]
    const normal = vec3Normalize(CUBE_FACE_NORMALS[faceIdx])

    // 应用物体旋转
    const rotatedNormal = vec3Add(
      vec3Scale(normal, Math.cos(obj.rotation.y)),
      { x: 0, y: 0, z: 0 }
    )

    // 背面剔除
    const camDir = vec3Normalize(vec3Sub(camera.position, obj.position))
    if (vec3Dot(normal, camDir) < 0) return

    // 计算光照
    const faceColor = computeFaceColor(normal, lights, material)

    // 绘制面
    ctx.save()
    ctx.beginPath()
    faceProjected.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.sx, p.sy)
      else ctx.lineTo(p.sx, p.sy)
    })
    ctx.closePath()

    // 填充
    ctx.fillStyle = faceColor
    ctx.fill()

    // 边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
  })

  // 绘制对象标签
  const center = vertices.reduce((acc, v) => ({
    x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z
  }), { x: 0, y: 0, z: 0 })
  const cx = projectPoint(center, camera, w, h)
  if (cx) {
    ctx.save()
    ctx.font = '9px system-ui'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.textAlign = 'center'
    ctx.fillText(obj.name, cx.sx, cx.sy - 10)
    ctx.restore()
  }
}

/**
 * 计算面颜色（光照）
 */
function computeFaceColor(
  normal: Vec3,
  lights: LightConfig[],
  material: MaterialConfig
): string {
  const matColor = hexToRgb(material.color)

  // 环境光
  let color = {
    r: matColor.r * 0.1,
    g: matColor.g * 0.1,
    b: matColor.b * 0.1
  }

  lights.forEach(light => {
    if (!light.enabled) return
    const lightDir = vec3Normalize(lightDirectionVector(light.direction))
    const lightColor = hexToRgb(light.color)
    const diffuse = Math.max(0, vec3Dot(normal, vec3Scale(lightDir, -1)))
    const intensity = light.intensity * (1 - material.roughness * 0.5) * diffuse

    color.r += lightColor.r * intensity * 0.3
    color.g += lightColor.g * intensity * 0.3
    color.b += lightColor.b * intensity * 0.3
  })

  // 自发光
  const emissiveColor = hexToRgb(material.emissive)
  color.r += emissiveColor.r * material.emissiveIntensity * 0.1
  color.g += emissiveColor.g * material.emissiveIntensity * 0.1
  color.b += emissiveColor.b * material.emissiveIntensity * 0.1

  // 金属感
  if (material.metalness > 0.5) {
    const metalBoost = material.metalness * 0.2
    color.r += 255 * metalBoost * 0.1
    color.g += 255 * metalBoost * 0.1
    color.b += 255 * metalBoost * 0.1
  }

  return `rgb(${Math.min(255, Math.round(color.r))}, ${Math.min(255, Math.round(color.g))}, ${Math.min(255, Math.round(color.b))})`
}

/**
 * 绘制相机指示器
 */
function drawCameraIndicator(ctx: CanvasRenderingContext2D, camera: CameraConfig, w: number, h: number): void {
  ctx.save()
  const camPos = projectPoint(camera.position, camera, w, h)
  if (camPos) {
    // 相机图标
    ctx.fillStyle = 'rgba(99, 102, 241, 0.9)'
    ctx.beginPath()
    ctx.arc(camPos.sx, camPos.sy, 4, 0, Math.PI * 2)
    ctx.fill()

    // 视锥线
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(camPos.sx, camPos.sy)
    const targetPos = projectPoint(camera.target, camera, w, h)
    if (targetPos) {
      ctx.lineTo(targetPos.sx, targetPos.sy)
    }
    ctx.stroke()
  }
  ctx.restore()
}

/**
 * 绘制 HUD 信息
 */
function drawHUD(
  ctx: CanvasRenderingContext2D,
  camera: CameraConfig,
  lights: LightConfig[],
  w: number,
  h: number
): void {
  ctx.save()
  ctx.font = '8px system-ui'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.textAlign = 'left'

  // 左上角相机信息
  ctx.fillText(`F${camera.focalLength}mm`, 6, 12)
  ctx.fillText(`FOV ${camera.fov}°`, 6, 22)
  ctx.fillText(camera.shotType.replace(/-/g, ' '), 6, 32)

  // 右上角灯光信息
  ctx.textAlign = 'right'
  const activeLights = lights.filter(l => l.enabled).length
  ctx.fillText(`🔆 ${activeLights}/${lights.length}`, w - 6, 12)

  ctx.restore()
}

// ============= 导出默认配置工厂 =============

export function createDefaultDirectorData(): import('../types').Scene3DDirectorData {
  return {
    name: '新 3D 场景',
    description: '3D 导演台',
    camera: { ...DEFAULT_CAMERA },
    lights: DEFAULT_LIGHTS.map(l => ({ ...l })),
    materials: DEFAULT_MATERIALS.map(m => ({ ...m })),
    environment: { ...DEFAULT_ENVIRONMENT },
    objects: DEFAULT_OBJECTS.map(o => ({ ...o })),
    animations: [],
    currentFrame: 0,
    isPlaying: false
  }
}
