<template>
  <div class="director-app">
    <div class="top-bar">
      <div class="top-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" width="16" height="16"><circle cx="12" cy="4" r="2"/><line x1="12" y1="6" x2="12" y2="14"/><line x1="6" y1="9" x2="18" y2="9"/><line x1="12" y1="14" x2="8" y2="20"/><line x1="12" y1="14" x2="16" y2="20"/></svg>
        <span class="app-title">3D 导演台</span>
        <span class="app-subtitle">Scene3D Editor</span>
      </div>
      <div class="top-center">
        <button v-for="tool in tools" :key="tool.key" class="tool-btn" :class="{ active: activeTool === tool.key }" @click="activeTool = tool.key" :title="tool.name"><svg v-html="tool.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"/></button>
      </div>
      <div class="top-right">
        <span class="top-tip">旋转 左键 · 平移 右键</span>
        <span class="view-mode">{{ activeView }}</span>
        <button class="icon-btn" @click="handleClose"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
    </div>
    <div class="main-body">
      <div class="left-icon-bar">
        <div v-for="tab in sidebarTabs" :key="tab.key" class="icon-item" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
          <svg v-html="tab.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"/>
          <span class="icon-label">{{ tab.label }}</span>
        </div>
      </div>
      <div class="left-content" v-show="sidebarExpanded">
        <div class="lc-header" @click="sidebarExpanded = false">
          <span class="lc-title">{{ getTabTitle(activeTab) }}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <div class="lc-body" v-if="activeTab === 'object'">
          <div class="search-box"><input v-model="objectSearch" type="text" placeholder="搜索对象"/></div>
          <div class="object-list">
            <div class="object-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg><span class="oi-name">3D场景</span></div>
            <div v-for="(r, i) in roles" :key="i" class="object-item" :class="{ selected: selectedRoleIdx === i }" @click="selectedRoleIdx = i">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
              <span class="oi-name">{{ r.name }}</span>
              <div class="oi-actions"><button class="oi-btn" @click.stop="duplicateRole(i)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>
            </div>
          </div>
        </div>
        <div class="lc-body" v-else-if="activeTab === 'mine'">
          <div class="filter-tabs"><button :class="{ active: mineFilter === 'all' }" @click="mineFilter = 'all'">全部</button><button :class="{ active: mineFilter === 'role' }" @click="mineFilter = 'role'">角色</button><button :class="{ active: mineFilter === 'prop' }" @click="mineFilter = 'prop'">道具</button><button :class="{ active: mineFilter === 'action' }" @click="mineFilter = 'action'">动作</button></div>
          <div class="search-box"><input v-model="mineSearch" type="text" placeholder="搜索我的素材"/></div>
          <div class="empty-msg">暂无我的素材</div>
        </div>
        <div class="lc-body" v-else-if="activeTab === 'character'">
          <div class="char-section"><div class="char-section-title">单人</div><div class="char-cards"><div class="char-card"><div class="char-thumb"><svg viewBox="0 0 40 50" width="36" height="44" fill="none" stroke="#8b5cf6" stroke-width="1.5"><circle cx="20" cy="8" r="5"/><line x1="20" y1="13" x2="20" y2="30"/><line x1="10" y1="17" x2="30" y2="17"/><line x1="20" y1="30" x2="15" y2="45"/><line x1="20" y1="30" x2="25" y2="45"/></svg></div><span class="char-name">单人</span><span class="char-tag">角色</span></div></div></div>
          <div class="char-section"><div class="char-section-title">群众</div><div class="char-cards"><div class="char-card"><div class="char-thumb"><svg viewBox="0 0 40 50" width="36" height="44" fill="none" stroke="#8b5cf6" stroke-width="1.5"><circle cx="14" cy="8" r="4"/><circle cx="26" cy="8" r="4"/><line x1="14" y1="12" x2="14" y2="28"/><line x1="26" y1="12" x2="26" y2="28"/></svg></div><span class="char-name">群众</span><span class="char-tag">角色</span></div></div></div>
        </div>
        <div class="lc-body" v-else-if="activeTab === 'prop'">
          <div class="filter-tabs"><button :class="{ active: propFilter === 'all' }" @click="propFilter = 'all'">全部</button><button :class="{ active: propFilter === 'animal' }" @click="propFilter = 'animal'">动物</button><button :class="{ active: propFilter === 'prop' }" @click="propFilter = 'prop'">道具</button><button :class="{ active: propFilter === 'scene' }" @click="propFilter = 'scene'">场景</button></div>
          <div class="search-box"><input v-model="propSearch" type="text" placeholder="搜索道具"/></div>
          <div class="prop-section"><div class="prop-section-title">基础形状</div><div class="prop-grid">
            <div v-for="p in shapeProps" :key="p.name" class="prop-card">
              <div class="prop-thumb"><svg viewBox="0 0 60 60" width="48" height="48" fill="none" stroke="#8b5cf6" stroke-width="1.5"><template v-if="p.icon==='cube'"><path d="M15 18 L30 10 L45 18 L45 35 L30 43 L15 35 Z"/><path d="M30 10 L30 30 L15 35"/><path d="M30 30 L45 35"/></template><template v-if="p.icon==='cone'"><path d="M12 45 L30 10 L48 45 Z"/><ellipse cx="30" cy="45" rx="18" ry="4"/></template><template v-if="p.icon==='cylinder'"><ellipse cx="30" cy="15" rx="16" ry="4"/><line x1="14" y1="15" x2="14" y2="45"/><line x1="46" y1="15" x2="46" y2="45"/><ellipse cx="30" cy="45" rx="16" ry="4"/></template><template v-if="p.icon==='capsule'"><path d="M14 20 Q14 10 30 10 Q46 10 46 20 L46 40 Q46 50 30 50 Q14 50 14 40 Z"/></template><template v-if="p.icon==='sphere'"><ellipse cx="30" cy="30" rx="18" ry="18"/><ellipse cx="30" cy="30" rx="18" ry="6" fill="none" stroke-width="0.8"/></template></svg></div>
              <span class="prop-name">{{ p.name }}</span><span class="prop-tag">道具</span>
            </div>
          </div></div>
          <div class="prop-section"><div class="prop-section-title">动物</div><div class="prop-grid">
            <div v-for="a in animalProps" :key="a.name" class="prop-card">
              <div class="prop-thumb"><svg viewBox="0 0 60 60" width="40" height="40" fill="none" stroke="#8b5cf6" stroke-width="1.5"><ellipse cx="30" cy="35" rx="14" ry="10"/><circle cx="20" cy="22" r="6"/><line x1="20" y1="16" x2="17" y2="12"/><line x1="23" y1="16" x2="25" y2="12"/></svg></div>
              <span class="prop-name">{{ a.name }}</span><span class="prop-tag">道具</span>
            </div>
          </div></div>
        </div>
        <div class="lc-body" v-else-if="activeTab === 'camera'">
          <div class="filter-tabs"><button :class="{ active: camFilter === 'all' }" @click="camFilter = 'all'">全部</button></div>
          <div class="cam-grid">
            <div v-for="c in camPresets" :key="c.name" class="cam-card" :class="{ active: activeCamPreset === c.name }" @click="selectCamPreset(c)">
              <div class="cam-thumb"><svg viewBox="0 0 60 60" width="48" height="48"><circle cx="30" cy="30" r="22" fill="none" stroke="#c4b5fd" stroke-width="1" opacity="0.5"/><circle cx="30" cy="30" r="14" fill="none" stroke="#6366f1" stroke-width="1.2" opacity="0.6"/><circle cx="30" cy="30" r="3" fill="#f59e0b"/></svg></div>
              <span class="cam-name">{{ c.name }}</span><span class="cam-tag">机位</span>
            </div>
          </div>
        </div>
        <div class="lc-body" v-else-if="activeTab === 'action'">
          <div class="filter-tabs"><button :class="{ active: actFilter === 'all' }" @click="actFilter = 'all'">全部</button><button :class="{ active: actFilter === 'walk' }" @click="actFilter = 'walk'">行走</button><button :class="{ active: actFilter === 'fight' }" @click="actFilter = 'fight'">战斗</button><button :class="{ active: actFilter === 'dance' }" @click="actFilter = 'dance'">舞蹈</button></div>
          <div class="search-box"><input v-model="actSearch" type="text" placeholder="搜索动作"/></div>
          <div class="action-grid">
            <div v-for="a in actionPresets" :key="a.name" class="action-card">
              <div class="action-thumb"><svg viewBox="0 0 40 50" width="32" height="40" fill="none" stroke="#8b5cf6" stroke-width="1.5"><circle cx="20" cy="6" r="4"/><line x1="20" y1="10" x2="20" y2="24"/><line x1="10" y1="14" x2="30" y2="14"/><line x1="20" y1="24" x2="16" y2="42"/><line x1="20" y1="24" x2="24" y2="42"/></svg></div>
              <span class="action-name">{{ a.name }}</span><span class="action-tag">动作</span>
            </div>
          </div>
        </div>
        <div class="lc-body" v-else-if="activeTab === 'motion'">
          <div class="motion-grid">
            <div v-for="m in motionList" :key="m.name" class="motion-card" :class="{ active: cameraMotion === m.key }" @click="cameraMotion = m.key">
              <div class="motion-thumb"><svg viewBox="0 0 60 60" width="44" height="44" fill="none" stroke="#6366f1" stroke-width="1.5"><circle cx="30" cy="30" r="20" fill="none" opacity="0.3"/><template v-if="m.key==='static'"><circle cx="30" cy="30" r="4" fill="#6366f1"/></template><template v-if="m.key==='dolly-in'"><line x1="10" y1="30" x2="50" y2="30"/><polygon points="42,24 50,30 42,36" fill="#6366f1" stroke="none"/></template><template v-if="m.key==='dolly-out'"><line x1="10" y1="30" x2="50" y2="30"/><polygon points="18,24 10,30 18,36" fill="#6366f1" stroke="none"/></template><template v-if="m.key==='pan-left'"><path d="M50 30a20 20 0 0 0-40 0"/><polyline points="14 22 14 30 22 30"/></template><template v-if="m.key==='pan-right'"><path d="M10 30a20 20 0 0 1 40 0"/><polyline points="46 22 46 30 38 30"/></template><template v-if="m.key==='tilt-up'"><line x1="10" y1="50" x2="50" y2="50"/><polygon points="30,14 38,30 22,30" fill="#6366f1" stroke="none"/></template><template v-if="m.key==='tilt-down'"><line x1="10" y1="10" x2="50" y2="10"/><polygon points="30,46 38,30 22,30" fill="#6366f1" stroke="none"/></template></svg></div>
              <span class="motion-name">{{ m.name }}</span><span class="motion-tag">运镜</span>
            </div>
          </div>
        </div>
        <div class="lc-body" v-else-if="activeTab === 'ai'"><div class="empty-msg">AI 识图功能</div></div>
      </div>
      <div class="lc-toggle" v-show="!sidebarExpanded" @click="sidebarExpanded = true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg></div>
      <div class="viewport-main">
        <div class="viewport-canvas-wrap" @mousedown="onCanvasMouseDown" @mousemove="onCanvasMouseMove" @mouseup="onCanvasMouseUp" @wheel.passive="onCanvasWheel">
          <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" class="viewport-canvas"/>
        </div>
        <div class="view-indicator">
          <div class="vi-card"><svg viewBox="0 0 40 40" width="36" height="36"><circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" stroke-width="0.8"/><line x1="20" y1="6" x2="20" y2="34" stroke="#10b981" stroke-width="1.5"/><text x="22" y="10" font-size="6" fill="#10b981" font-weight="bold">Y</text><line x1="6" y1="22" x2="34" y2="22" stroke="#ef4444" stroke-width="1.5"/><text x="35" y="24" font-size="6" fill="#ef4444" font-weight="bold">X</text><circle cx="30" cy="30" r="4" fill="#6366f1"/><text x="30" y="32" font-size="5" fill="#fff" text-anchor="middle" font-weight="bold">Z</text></svg></div>
          <button class="vi-reset" @click="resetCamera"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>重置视角</button>
        </div>
        <div class="floating-toolbar">
          <button class="ft-ic" title="主视图"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg></button>
          <button class="ft-ic" @click="resetCamera"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>
          <button class="ft-ic" title="新增"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="ft-ic" @click="prevFrame"><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="11 18 2 9 11 0 11 5 17 9 11 13 11 18 19 19 12 22 12 18 11 18"/></svg></button>
          <button class="ft-ic" @click="nextFrame"><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="13 18 22 9 13 0 13 5 7 9 13 13 13 18 5 19 12 22 12 18 13 18"/></svg></button>
          <button class="ft-ic" :class="{ active: isPlaying }" @click="togglePlay"><svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"/></svg><svg v-else viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button>
          <button class="ft-ic" title="锚点"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><path d="M8 12h8"/><path d="M9 21h6"/></svg></button>
        </div>
      </div>
      <div class="right-panel">
        <div class="rp-section">
          <div class="rp-section-head">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
            <span class="rp-section-title">{{ selectedRoleIdx !== null ? roles[selectedRoleIdx].name : '角色1' }}</span>
            <div class="rp-section-actions"><button class="rp-action-btn">属性</button><button class="rp-action-btn">运动轨道</button></div>
          </div>
          <div class="rp-props">
            <div class="rp-row"><span class="rp-label">显示骨骼</span><label class="rp-switch"><input type="checkbox" v-model="showSkeleton"/><span class="rp-slider"></span></label></div>
            <div class="rp-collapse" @click="collapseTransform = !collapseTransform"><span class="rp-collapse-title">变换</span><div class="rp-collapse-actions"><button class="rp-mini-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button><button class="rp-mini-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polyline points="9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg></button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polyline :points="collapseTransform ? '6 9 12 15 18 9' : '6 15 12 9 18 15'"/></svg></div></div>
            <div class="rp-sub" v-if="collapseTransform">
              <div class="rp-sub-title">位置 (cm)</div><div class="rp-axis3"><div class="ax-item"><span class="ax-label">X</span><input type="number" v-model.number="rolePos.x" step="1"/></div><div class="ax-item"><span class="ax-label">Y</span><input type="number" v-model.number="rolePos.y" step="1"/></div><div class="ax-item"><span class="ax-label">Z</span><input type="number" v-model.number="rolePos.z" step="1"/></div></div>
              <div class="rp-sub-title">旋转</div><div class="rp-axis3"><div class="ax-item"><span class="ax-label">X</span><input type="number" v-model.number="roleRot.x" step="1"/></div><div class="ax-item"><span class="ax-label">Y</span><input type="number" v-model.number="roleRot.y" step="1"/></div><div class="ax-item"><span class="ax-label">Z</span><input type="number" v-model.number="roleRot.z" step="1"/></div></div>
              <div class="rp-sub-title">缩放</div><div class="rp-axis3"><div class="ax-item"><span class="ax-label">X</span><input type="number" v-model.number="roleScale.x" step="0.1" min="0.1"/></div><div class="ax-item"><span class="ax-label">Y</span><input type="number" v-model.number="roleScale.y" step="0.1" min="0.1"/></div><div class="ax-item"><span class="ax-label">Z</span><input type="number" v-model.number="roleScale.z" step="0.1" min="0.1"/></div></div>
            </div>
            <div class="rp-collapse" @click="collapseMaterial = !collapseMaterial"><span class="rp-collapse-title">材质</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polyline :points="collapseMaterial ? '6 9 12 15 18 9' : '6 15 12 9 18 15'"/></svg></div>
            <div class="rp-sub" v-if="collapseMaterial"><div class="rp-sub-title">颜色</div><div class="color-grid"><div v-for="c in materialColors" :key="c" class="color-swatch" :class="{ selected: characterColor === c }" :style="{ background: c }" @click="characterColor = c"/></div></div>
            <div class="rp-collapse" @click="collapsePose = !collapsePose"><span class="rp-collapse-title">姿势编辑</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polyline :points="collapsePose ? '6 9 12 15 18 9' : '6 15 12 9 18 15'"/></svg></div>
            <div class="rp-sub" v-if="collapsePose"><div class="rp-sub-title">第 0 帧 - 角色1</div><div class="pose-tags"><button class="pose-tag">姿势预设</button><button class="pose-tag">姿态调整</button><button class="pose-tag">骨架编辑</button></div></div>
          </div>
        </div>
      </div>
    </div>
    <div class="timeline-area">
      <div class="tl-header">
        <div class="tl-header-left">
          <div class="tl-playback">
            <button class="tl-pb" @click="goToStart"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="19,20 11,20 19,8"/></svg></button>
            <button class="tl-pb" @click="prevFrame"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="11,20 11,4 3,20"/></svg></button>
            <button class="tl-pb" :class="{ active: isPlaying }" @click="togglePlay"><svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="8,5 8,19 19,12"/></svg><svg v-else viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button>
            <button class="tl-pb" @click="nextFrame"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="13,4 13,20 21,4"/></svg></button>
            <button class="tl-pb" @click="goToEnd"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5,20 13,20 5,8"/></svg></button>
            <button class="tl-key" :class="{ active: keyMode }" @click="keyMode = !keyMode"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg></button>
            <div class="tl-jump">
              <button class="tl-jp" @click="jumpPrev"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="6,3 6,21 20,12"/></svg></button>
              <button class="tl-jp" @click="jumpNext"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="18,3 18,21 4,12"/></svg></button>
            </div>
          </div>
          <div class="tl-frame">
            <span class="tl-frame-label">帧</span>
            <input type="number" :value="frameInput" @change="handleFrameInput($event)" class="tl-frame-input" />
            <span class="tl-sep">/</span>
            <span class="tl-frame-total">{{ totalFrames }}</span>
          </div>
          <div class="tl-fps">
            <span class="tl-fps-label">FPS</span>
            <input type="number" :value="fps" @change="fps = Math.max(1, Number($event.target.value))" class="tl-fps-input" />
          </div>
          <div class="tl-ease">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M3 21 Q3 3 21 3"/></svg>
            <span>贝塞尔</span>
          </div>
          <div class="tl-sep-v"></div>
          <span class="tl-zoom-label">缩放</span>
          <div class="tl-zoom-bar">
            <span class="tl-zoom-line"></span>
            <div class="tl-zoom-handle" :style="{ left: ((timelineZoom - 1) / 4 * 100) + '%' }"></div>
          </div>
          <button class="tl-zoom-in" @click="timelineZoom = Math.min(5, timelineZoom + 0.5)">+</button>
          <button class="tl-zoom-out" @click="timelineZoom = Math.max(1, timelineZoom - 0.5)">-</button>
        </div>
      </div>
      <div class="tl-grid">
        <div class="tl-row-labels">
          <div class="tl-time-label">
            <div class="tl-time-num-row">
              <span class="tl-time-num" v-for="t in tlTickFrames" :key="'t-'+t" :style="{ left: (t * pixelsPerFrame) + 'px' }">{{ t }}</span>
            </div>
          </div>
          <div class="tl-role-labels">
            <div v-for="(r, i) in timelineRoles" :key="'lbl-'+i" class="tl-role-label-row" @click="selectedRoleIdx = i" @mousedown.stop>
              <div class="tl-rl-thumb" :style="{ background: r.color }">
                <svg viewBox="0 0 30 36" width="22" height="28">
                  <g fill="rgba(255,255,255,0.92)">
                    <circle cx="15" cy="6" r="4"/>
                    <rect x="10" y="10" width="10" height="14" rx="2"/>
                    <rect x="3" y="11" width="4" height="10" rx="1"/>
                    <rect x="23" y="11" width="4" height="10" rx="1"/>
                    <rect x="11" y="24" width="3.5" height="9" rx="1"/>
                    <rect x="15.5" y="24" width="3.5" height="9" rx="1"/>
                  </g>
                </svg>
              </div>
              <div class="tl-rl-name">{{ r.name }}</div>
              <div class="tl-rl-actions">
                <button class="tl-mini-act" :class="{ active: r.locked }" @click.stop="r.locked = !r.locked">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" v-if="r.locked"/>
                    <path d="M12 2v9" v-else/>
                  </svg>
                </button>
                <button class="tl-mini-act">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="tl-track-area" @mousedown="onTrackMouseDown">
          <div class="tl-track-header" :style="{ transform: 'translateX(' + (-timelineScroll) + 'px)' }">
            <div class="tl-ruler">
              <div class="tl-ruler-bg" :style="{ width: (totalFrames * pixelsPerFrame) + 'px' }"></div>
              <div class="tl-ruler-ticks">
                <div class="tl-ruler-tick" v-for="t in tlTickFrames" :key="'rt-'+t" :style="{ left: (t * pixelsPerFrame) + 'px' }" :class="{ major: t % 30 === 0 }"></div>
              </div>
            </div>
          </div>
          <div class="tl-track-rows" :style="{ transform: 'translateX(' + (-timelineScroll) + 'px)' }">
            <div v-for="(r, i) in timelineRoles" :key="'track-'+i" class="tl-track-row" :class="{ selected: selectedRoleIdx === i }">
              <div class="tl-role-bar" :style="{ left: r.start + 'px', width: r.duration + 'px', background: r.color }">
                <span class="tl-role-bar-label">{{ r.name }}</span>
              </div>
              <div class="tl-key-dots">
                <div v-for="kf in r.keyframes" :key="'kf-'+i+'-'+kf.frame" class="tl-key-dot" :style="{ left: (kf.frame * pixelsPerFrame) + 'px' }" :class="{ active: kf.frame === frameInput }" @click="jumpTo(kf.frame)">
                  <svg viewBox="0 0 14 14" width="10" height="10"><polygon points="7,1 8.4,5.5 13,5.5 9.5,8.2 10.8,13 7,10.4 3.2,13 4.5,8.2 1,5.5 5.6,5.5"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div class="tl-global-playhead" :style="{ left: (frameInput * pixelsPerFrame) + 'px' }" @mousedown.stop="startDragPlayhead"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Scene3DDirectorData, CameraMotion } from '../types'

const props = defineProps<{ show: boolean; nodeData: Scene3DDirectorData }>()
const emit = defineEmits<{ close: []; save: [data: Scene3DDirectorData]; 'update:data': [data: Scene3DDirectorData] }>()

const activeTool = ref('select'), activeView = ref('主视图'), activeTab = ref('object'), sidebarExpanded = ref(true), isPlaying = ref(false), timelineZoom = ref(1), viewportZoom = ref(100)
const selectedRoleIdx = ref(0), showSkeleton = ref(false), collapseTransform = ref(true), collapseMaterial = ref(false), collapsePose = ref(false)
const rolePos = ref({ x: 0, y: 0, z: 0 }), roleRot = ref({ x: 0, y: 0, z: 0 }), roleScale = ref({ x: 1, y: 1, z: 1 })
const characterColor = ref('#d8b4fe'), characterOpacity = ref(100), shadowOpacity = ref(60), groundY = ref(0), showGrid = ref(true), showCharacter = ref(true), showGround = ref(true)
const cameraOffset = ref({ x: 0, y: 0 }), cameraMotion = ref('static' as CameraMotion), characterPos = ref({ x: 0, y: 0, z: 0 })
const objectSearch = ref(''), mineSearch = ref(''), propSearch = ref(''), actSearch = ref(''), mineFilter = ref('all'), propFilter = ref('all'), camFilter = ref('all'), actFilter = ref('all')
const activeCamPreset = ref('当前视角'), canvasRef = ref<HTMLCanvasElement | null>(null), canvasWidth = ref(900), canvasHeight = ref(600)
let renderFrameId = 0, isDragging = false, isCharacterDragging = false, dragStartX = 0, dragStartY = 0

const fps = computed({ get: () => props.nodeData.fps || 30, set: (v: number) => emit('update:data', { ...props.nodeData, fps: Math.max(1, v) }) })
const totalFrames = computed({ get: () => props.nodeData.totalFrames || 150, set: (v: number) => emit('update:data', { ...props.nodeData, totalFrames: Math.max(1, v) }) })
const frameInput = computed({ get: () => props.nodeData.currentFrame, set: (v: number) => emit('update:data', { ...props.nodeData, currentFrame: Math.max(0, Math.min(v, totalFrames.value)) }) })

const sidebarTabs = [
  { key: 'object', label: '对象', icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' },
  { key: 'mine', label: '我的', icon: '<circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' },
  { key: 'character', label: '角色', icon: '<circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' },
  { key: 'prop', label: '道具', icon: '<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>' },
  { key: 'camera', label: '机位', icon: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/>' },
  { key: 'action', label: '动作', icon: '<path d="M23 12A11 11 0 1 1 12 1v10a8 8 0 0 0 8 8V12z"/>' },
  { key: 'motion', label: '运镜', icon: '<path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.59-9.21l5.25 4.75"/>' },
  { key: 'ai', label: 'AI识图', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>' },
]
const getTabTitle = (key: string) => ({ object: '对象', mine: '我的', character: '角色', prop: '道具', camera: '机位', action: '动作', motion: '运镜', ai: 'AI识图' }[key] || '对象')
const roles = [{ name: '角色1' }, { name: '角色2' }, { name: '角色3' }]
const materialColors = ['#d8b4fe', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff', '#000000', '#f97316', '#22c55e']
const shapeProps = [{ name: '正方体', icon: 'cube' }, { name: '圆锥', icon: 'cone' }, { name: '圆柱体', icon: 'cylinder' }, { name: '胶囊体', icon: 'capsule' }, { name: '球体', icon: 'sphere' }]
const animalProps = [{ name: '虎斑猫' }, { name: '绿色鹦鹉' }, { name: '鸽子群' }, { name: '暹罗猫' }]
const camPresets = ['当前视角','正面中景','正面特写','正面全景','侧面近拍','侧面远景','顶面中景','顶面全景','45°仰拍','低角度仰拍','低角度广角','过肩镜头'].map(n => ({ name: n }))
const actionPresets = ['站立','行走','跑步','跳跃','挥手','点头'].map(n => ({ name: n }))
const motionList = [{ name: '静止', key: 'static' as CameraMotion },{ name: '推镜头', key: 'dolly-in' as CameraMotion },{ name: '拉镜头', key: 'dolly-out' as CameraMotion },{ name: '左摇', key: 'pan-left' as CameraMotion },{ name: '右摇', key: 'pan-right' as CameraMotion },{ name: '上摇', key: 'tilt-up' as CameraMotion },{ name: '下摇', key: 'tilt-down' as CameraMotion }]
const tools = [
  { key: 'select', name: '选择', icon: '<path d="M5 3l14 9-6 1-3 6z"/>' },
  { key: 'rotate', name: '旋转', icon: '<path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.59-9.21l5.25 4.75"/>' },
  { key: 'move', name: '平移', icon: '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 15 22 12 19 9"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>' },
  { key: 'scale', name: '缩放', icon: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>' },
]

function handleClose() { emit('close') }
function handleUpdateData(data: Scene3DDirectorData) { emit('update:data', data) }
function togglePlay() { isPlaying.value = !isPlaying.value; emit('update:data', { ...props.nodeData, isPlaying: isPlaying.value }) }
function prevFrame() { frameInput.value = Math.max(frameInput.value - 1, 0) }
function nextFrame() { frameInput.value = Math.min(frameInput.value + 1, totalFrames.value) }
function goToStart() { frameInput.value = 0 }
function goToEnd() { frameInput.value = totalFrames.value }
function handleFrameInput(e: Event) { frameInput.value = Math.max(0, Math.min(Number((e.target as HTMLInputElement).value), totalFrames.value)) }
function resetCamera() { cameraOffset.value = { x: 0, y: 0 }; viewportZoom.value = 100 }
function duplicateRole(idx: number) { roles.splice(idx + 1, 0, { ...roles[idx], name: roles[idx].name + ' (副本)' }); selectedRoleIdx.value = idx + 1 }
function selectCamPreset(c: { name: string }) {
  activeCamPreset.value = c.name
  if (c.name !== '当前视角') { cameraOffset.value = { x: 0, y: 0 } }
}
function jumpTo(frame: number) { frameInput.value = frame }
function jumpPrev() { frameInput.value = Math.max(frameInput.value - 30, 0) }
function jumpNext() { frameInput.value = Math.min(frameInput.value + 30, totalFrames.value) }

// ====== 时间轴 ======
const timelineScroll = ref(0)
const pixelsPerFrame = computed(() => 6 * timelineZoom.value)
const tlTickFrames = computed(() => {
  const step = timelineZoom.value >= 3 ? 5 : timelineZoom.value >= 1.5 ? 10 : 15
  const arr: number[] = []
  for (let i = 0; i <= totalFrames.value; i += step) arr.push(i)
  if (arr[arr.length - 1] < totalFrames.value) arr.push(totalFrames.value)
  return arr
})

const timelineRoles = ref([
  { name: '角色1', color: '#d8b4fe', locked: false, start: 0, duration: 900, keyframes: [{ frame: 0 }, { frame: 25 }, { frame: 50 }, { frame: 75 }] },
  { name: '角色2', color: '#60a5fa', locked: false, start: 200, duration: 700, keyframes: [{ frame: 10 }, { frame: 40 }, { frame: 60 }] },
  { name: '角色3', color: '#f59e0b', locked: false, start: 350, duration: 500, keyframes: [{ frame: 20 }, { frame: 55 }] },
])

let isDraggingPlayhead = false
function startDragPlayhead(e: MouseEvent) {
  e.stopPropagation()
  isDraggingPlayhead = true
  const onMove = (ev: MouseEvent) => {
    if (!isDraggingPlayhead) return
    const area = (e.currentTarget as HTMLElement).closest('.tl-track-area')
    if (!area) return
    const r = area.getBoundingClientRect()
    const x = ev.clientX - r.left + timelineScroll.value
    const frame = Math.max(0, Math.min(Math.round(x / pixelsPerFrame.value), totalFrames.value))
    frameInput.value = frame
  }
  const onUp = () => { isDraggingPlayhead = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function onTrackMouseDown(e: MouseEvent) {
  const track = e.currentTarget as HTMLElement
  const r = track.getBoundingClientRect()
  const x = e.clientX - r.left + timelineScroll.value
  const frame = Math.max(0, Math.min(Math.round(x / pixelsPerFrame.value), totalFrames.value))
  frameInput.value = frame
  startDragPlayhead(e)
}

let isDraggingScroll = false, scrollStartX = 0, scrollStart = 0

function onCanvasMouseDown(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect(), mx = e.clientX - rect.left, my = e.clientY - rect.top
  if (activeTool.value === 'select') {
    const cx = canvas.width / 2 + cameraOffset.value.x + characterPos.value.x, cy = canvas.height * 0.62 + cameraOffset.value.y + characterPos.value.y
    if (Math.abs(mx - cx) < 30 && my < cy + 80 && my > cy - 120) { isCharacterDragging = true; return }
  }
  if (activeTool.value !== 'move') return
  isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY
}
function onCanvasMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  if (isCharacterDragging) {
    const r = canvas.getBoundingClientRect()
    characterPos.value.x = (e.clientX - r.left - canvas.width / 2 - cameraOffset.value.x) * 0.05
    characterPos.value.y = (e.clientY - r.top - canvas.height * 0.62 - cameraOffset.value.y) * 0.05
    return
  }
  if (!isDragging) return
  cameraOffset.value.x += (e.clientX - dragStartX) * 0.05
  cameraOffset.value.y += (e.clientY - dragStartY) * 0.05
  dragStartX = e.clientX; dragStartY = e.clientY
}
function onCanvasMouseUp() { isDragging = false; isCharacterDragging = false }
function onCanvasWheel(e: WheelEvent) { e.preventDefault(); viewportZoom.value = Math.max(25, Math.min(200, viewportZoom.value - Math.sign(e.deltaY) * 5)) }

function handleResize() {
  nextTick(() => {
    if (canvasRef.value && canvasRef.value.parentElement) {
      canvasWidth.value = canvasRef.value.parentElement.clientWidth || 900
      canvasHeight.value = canvasRef.value.parentElement.clientHeight || 600
    }
  })
}
onMounted(() => { handleResize(); window.addEventListener('resize', handleResize); renderFrame() })
onUnmounted(() => { window.removeEventListener('resize', handleResize); if (renderFrameId) cancelAnimationFrame(renderFrameId) })

function renderFrame() {
  const canvas = canvasRef.value
  if (!canvas) { renderFrameId = requestAnimationFrame(renderFrame); return }
  const ctx = canvas.getContext('2d')
  if (!ctx) { renderFrameId = requestAnimationFrame(renderFrame); return }
  const w = canvas.width, h = canvas.height
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e8eaf0'); g.addColorStop(1, '#d5d8de')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  drawGrid(ctx, w, h)
  drawHumanoid(ctx, w, h)
  renderFrameId = requestAnimationFrame(renderFrame)
}
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2 + cameraOffset.value.x, cy = h * 0.62 + cameraOffset.value.y, z = viewportZoom.value / 100
  ctx.lineWidth = 1
  for (let i = 0; i <= 22; i++) {
    const t = i / 22, p = 1 / (1 + t * 2.2)
    ctx.strokeStyle = `rgba(120,130,145,${0.2 * p})`
    ctx.beginPath(); ctx.moveTo(cx - 400 * p * z, cy - t * h * 0.5); ctx.lineTo(cx + 400 * p * z, cy - t * h * 0.5); ctx.stroke()
  }
  for (let j = -10; j <= 10; j++) {
    ctx.strokeStyle = 'rgba(120,130,145,0.12)'
    ctx.beginPath(); ctx.moveTo(cx + j * 40 * 0.18, cy); ctx.lineTo(cx + j * 40 * z, cy - h * 0.5); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(239,68,68,0.6)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(cx - 80, cy); ctx.lineTo(cx + 80, cy); ctx.stroke()
  ctx.strokeStyle = 'rgba(16,185,129,0.6)'
  ctx.beginPath(); ctx.moveTo(cx, cy - 60); ctx.lineTo(cx, cy + 10); ctx.stroke()
  ctx.lineWidth = 1
}
function drawHumanoid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2 + cameraOffset.value.x + characterPos.value.x, cy = h * 0.62 + cameraOffset.value.y + characterPos.value.y, z = viewportZoom.value / 100
  const hex = characterColor.value, r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16), alpha = characterOpacity.value / 100
  const hl = `rgba(${Math.min(255,r+15)},${Math.min(255,g+15)},${Math.min(255,b+15)},${alpha})`, main = `rgba(${r},${g},${b},${alpha})`, sh = `rgba(${Math.max(0,r-12)},${Math.max(0,g-12)},${Math.max(0,b-12)},${alpha})`
  function lg(xc: number, ww: number) { const gd = ctx.createLinearGradient(xc - ww, 0, xc + ww, 0); gd.addColorStop(0, sh); gd.addColorStop(0.35, main); gd.addColorStop(0.65, main); gd.addColorStop(1, sh); return gd }
  ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z)
  const headY = -78, headR = 10, chestTopY = headY + headR + 2, waistY = -4, hipY = 12, kneeY = 38, ankleY = 56, footY = 62
  const hg = ctx.createRadialGradient(-2, headY - 3, 2, 0, headY, headR); hg.addColorStop(0, hl); hg.addColorStop(0.5, main); hg.addColorStop(1, sh)
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, headY, headR, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = main; ctx.fillRect(-2.5, headY + headR, 5, 4)
  ctx.fillStyle = lg(0, 14); ctx.beginPath()
  ctx.moveTo(-9, chestTopY); ctx.bezierCurveTo(-11, chestTopY+6, -10, chestTopY+12, -6, chestTopY+18); ctx.bezierCurveTo(-4, waistY+2, -5, hipY-4, -7, hipY)
  ctx.lineTo(7, hipY); ctx.bezierCurveTo(5, hipY-4, 4, waistY+2, 6, chestTopY+18); ctx.bezierCurveTo(10, chestTopY+12, 11, chestTopY+6, 9, chestTopY); ctx.closePath(); ctx.fill()
  ctx.fillStyle = lg(-32, 6); ctx.beginPath(); ctx.moveTo(-12, chestTopY); ctx.lineTo(-6, chestTopY); ctx.lineTo(-53, chestTopY+4); ctx.lineTo(-53, chestTopY-4); ctx.lineTo(-6, chestTopY-8); ctx.lineTo(-12, chestTopY-8); ctx.closePath(); ctx.fill()
  ctx.fillStyle = lg(32, 6); ctx.beginPath(); ctx.moveTo(6, chestTopY); ctx.lineTo(12, chestTopY); ctx.lineTo(53, chestTopY-8); ctx.lineTo(53, chestTopY+4); ctx.lineTo(6, chestTopY); ctx.closePath(); ctx.fill()
  ctx.fillStyle = lg(4.5, 7); ctx.beginPath(); ctx.moveTo(-7, hipY); ctx.lineTo(-1, hipY); ctx.lineTo(-3, kneeY); ctx.lineTo(-3, kneeY); ctx.closePath(); ctx.fill()
  ctx.fillStyle = lg(5.5, 5); ctx.beginPath(); ctx.moveTo(-3, kneeY); ctx.lineTo(1, kneeY); ctx.lineTo(0, ankleY); ctx.lineTo(-2, ankleY); ctx.closePath(); ctx.fill()
  ctx.fillStyle = lg(-4.5, 7); ctx.beginPath(); ctx.moveTo(1, hipY); ctx.lineTo(7, hipY); ctx.lineTo(3, kneeY); ctx.lineTo(-3, kneeY); ctx.closePath(); ctx.fill()
  ctx.fillStyle = lg(-5.5, 5); ctx.beginPath(); ctx.moveTo(3, kneeY); ctx.lineTo(1, kneeY); ctx.lineTo(2, ankleY); ctx.lineTo(0, ankleY); ctx.closePath(); ctx.fill()
  ctx.fillStyle = sh; ctx.fillRect(-5, ankleY, 5, 8); ctx.fillRect(1, ankleY, 5, 8)
  ctx.fillStyle = `rgba(16,185,129,${alpha})`; ctx.beginPath(); ctx.arc(0, footY+3, 2.5, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = `rgba(16,185,129,${alpha})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, footY+5); ctx.lineTo(0, footY+22); ctx.stroke()
  ctx.restore()
  const sx = cx, sy = cy + footY * z + 3 * z
  if (shadowOpacity.value > 0) {
    const sg = ctx.createRadialGradient(sx, sy, 3, sx, sy, 42*z); sg.addColorStop(0, `rgba(0,0,0,${0.2*shadowOpacity.value/100})`); sg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(sx, sy, 36*z, 9*z, 0, 0, Math.PI*2); ctx.fill()
  }
  const lx = cx, ly = cy + (headY - headR) * z - 24 * z
  ctx.fillStyle = `rgba(${r},${g},${b},0.92)`; ctx.beginPath(); ctx.roundRect(lx - 38, ly, 76, 24, 5); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px "Microsoft YaHei", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('角色1', lx, ly + 12)
}
</script>

<style scoped>
.director-app { position: fixed; inset: 0; z-index: 9999; background: #f0f2f5; display: flex; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif; }
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #fff; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; height: 44px; box-sizing: border-box; }
.top-left { display: flex; align-items: center; gap: 8px; }
.app-title { font-size: 14px; font-weight: 600; color: #1f2937; }
.app-subtitle { font-size: 11px; color: #9ca3af; font-family: monospace; }
.top-center { display: flex; gap: 2px; }
.tool-btn { width: 32px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #6b7280; border-radius: 6px; cursor: pointer; transition: all 0.12s; }
.tool-btn:hover { background: #f3f4f6; color: #374151; }
.tool-btn.active { background: #eef2ff; color: #6366f1; }
.top-right { display: flex; align-items: center; gap: 6px; }
.top-tip { font-size: 10px; color: #6b7280; padding: 0 4px; }
.view-mode { font-size: 11px; color: #4b5563; padding: 4px 10px; border-radius: 4px; background: #f3f4f6; }
.icon-btn { width: 30px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #6b7280; border-radius: 4px; cursor: pointer; }
.icon-btn:hover { background: #f3f4f6; }
.main-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }
.left-icon-bar { width: 52px; background: #fff; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; }
.icon-item { display: flex; flex-direction: column; align-items: center; padding: 8px 4px; cursor: pointer; color: #6b7280; transition: all 0.12s; gap: 3px; border-left: 2px solid transparent; }
.icon-item:hover { color: #1f2937; background: #f3f4f6; }
.icon-item.active { color: #6366f1; border-left-color: #6366f1; background: #eef2ff; }
.icon-label { font-size: 9px; }
.left-content { width: 220px; background: #fff; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; }
.lc-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-bottom: 1px solid #e5e7eb; cursor: pointer; }
.lc-header:hover { background: #f3f4f6; }
.lc-title { font-size: 12px; font-weight: 600; color: #1f2937; flex: 1; }
.lc-body { flex: 1; overflow-y: auto; padding: 8px; }
.lc-toggle { position: absolute; left: 52px; top: 60px; width: 20px; height: 28px; background: #fff; border: 1px solid #e5e7eb; border-left: none; border-radius: 0 4px 4px 0; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; }
.search-box { position: relative; margin-bottom: 6px; }
.search-box input { width: 100%; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #1f2937; background: #f9fafb; outline: none; box-sizing: border-box; }
.search-box input:focus { border-color: #6366f1; }
.filter-tabs { display: flex; gap: 3px; margin-bottom: 6px; }
.filter-tabs button { flex: 1; padding: 4px; border: 1px solid #e5e7eb; background: #f9fafb; color: #4b5563; border-radius: 6px; cursor: pointer; font-size: 10px; transition: all 0.12s; }
.filter-tabs button.active { border-color: #6366f1; background: #eef2ff; color: #6366f1; }
.empty-msg { font-size: 11px; color: #9ca3af; text-align: center; padding: 20px; }
.object-list { display: flex; flex-direction: column; gap: 2px; }
.object-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 12px; transition: all 0.12s; }
.object-item:hover { background: #f3f4f6; color: #1f2937; }
.object-item.selected { background: #f3f4f6; color: #6366f1; font-weight: 500; }
.oi-name { flex: 1; }
.oi-actions { display: flex; gap: 2px; }
.oi-btn { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #9ca3af; border-radius: 4px; cursor: pointer; }
.oi-btn:hover { background: #e5e7eb; color: #1f2937; }
.char-section { margin-bottom: 12px; }
.char-section-title { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 6px; }
.char-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.char-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; transition: all 0.12s; }
.char-card:hover { border-color: #6366f1; background: #eef2ff; }
.char-thumb { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.char-name { font-size: 10px; color: #4b5563; display: block; margin-top: 4px; }
.char-tag { font-size: 9px; color: #6366f1; }
.prop-section { margin-bottom: 12px; }
.prop-section-title { font-size: 11px; font-weight: 600; color: #1f2937; margin-bottom: 6px; }
.prop-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.prop-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; transition: all 0.12s; }
.prop-card:hover { border-color: #6366f1; background: #eef2ff; }
.prop-thumb { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.prop-name { font-size: 10px; color: #4b5563; display: block; margin-top: 4px; }
.prop-tag { font-size: 9px; color: #6366f1; }
.cam-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.cam-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; transition: all 0.12s; }
.cam-card:hover { border-color: #6366f1; background: #eef2ff; }
.cam-card.active { border-color: #6366f1; background: #eef2ff; }
.cam-thumb { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.cam-name { font-size: 10px; color: #4b5563; display: block; margin-top: 4px; }
.cam-tag { font-size: 9px; color: #6366f1; }
.action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.action-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; transition: all 0.12s; }
.action-card:hover { border-color: #6366f1; background: #eef2ff; }
.action-thumb { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.action-name { font-size: 10px; color: #4b5563; display: block; margin-top: 4px; }
.action-tag { font-size: 9px; color: #6366f1; }
.motion-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.motion-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; transition: all 0.12s; }
.motion-card:hover { border-color: #6366f1; background: #eef2ff; }
.motion-card.active { border-color: #6366f1; background: #eef2ff; }
.motion-thumb { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.motion-name { font-size: 10px; color: #4b5563; display: block; margin-top: 4px; }
.motion-tag { font-size: 9px; color: #6366f1; }

.viewport-main { flex: 1; position: relative; background: #d5d8de; overflow: hidden; min-width: 0; }
.viewport-canvas-wrap { position: absolute; inset: 0; overflow: hidden; }
.viewport-canvas { width: 100%; height: 100%; display: block; cursor: grab; }
.viewport-canvas:active { cursor: grabbing; }
.view-indicator { position: absolute; top: 8px; right: 8px; display: flex; flex-direction: column; gap: 4px; }
.vi-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.vi-reset { display: flex; align-items: center; gap: 4px; padding: 6px 10px; border: 1px solid #e5e7eb; background: #fff; color: #4b5563; border-radius: 8px; cursor: pointer; font-size: 11px; transition: all 0.12s; }
.vi-reset:hover { background: #f3f4f6; }
.floating-toolbar { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 22px; padding: 4px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.ft-ic { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #4b5563; border-radius: 16px; cursor: pointer; transition: all 0.12s; }
.ft-ic:hover { background: #f3f4f6; }
.ft-ic.active { background: #eef2ff; color: #6366f1; }

.right-panel { width: 268px; background: #fff; border-left: 1px solid #e5e7eb; overflow-y: auto; flex-shrink: 0; padding: 10px; }
.rp-section { margin-bottom: 12px; }
.rp-section-head { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; }
.rp-section-title { font-size: 12px; font-weight: 600; color: #1f2937; flex: 1; }
.rp-section-actions { display: flex; gap: 4px; }
.rp-action-btn { padding: 3px 8px; border: 1px solid #e5e7eb; background: #fff; color: #4b5563; border-radius: 4px; cursor: pointer; font-size: 10px; transition: all 0.12s; }
.rp-action-btn:hover { background: #f3f4f6; border-color: #6366f1; color: #6366f1; }
.rp-props { display: flex; flex-direction: column; gap: 4px; }
.rp-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; }
.rp-label { font-size: 11px; color: #4b5563; }
.rp-switch { position: relative; width: 32px; height: 18px; }
.rp-switch input { opacity: 0; width: 0; height: 0; }
.rp-slider { position: absolute; inset: 0; background: #e5e7eb; border-radius: 18px; cursor: pointer; transition: 0.12s; }
.rp-slider:before { content: ""; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: 0.12s; }
.rp-switch input:checked + .rp-slider { background: #6366f1; }
.rp-switch input:checked + .rp-slider:before { transform: translateX(14px); }
.rp-collapse { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; cursor: pointer; border-radius: 6px; transition: all 0.12s; }
.rp-collapse:hover { background: #f3f4f6; }
.rp-collapse-title { font-size: 12px; font-weight: 600; color: #1f2937; }
.rp-collapse-actions { display: flex; align-items: center; gap: 4px; }
.rp-mini-btn { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #9ca3af; border-radius: 4px; cursor: pointer; }
.rp-mini-btn:hover { background: #e5e7eb; color: #1f2937; }
.rp-sub { padding: 4px 8px 8px; display: flex; flex-direction: column; gap: 6px; }
.rp-sub-title { font-size: 10px; color: #6b7280; font-weight: 500; }
.rp-axis3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.ax-item { display: flex; align-items: center; gap: 4px; }
.ax-label { font-size: 10px; font-weight: 600; color: #6366f1; width: 12px; }
.ax-item input { width: 48px; border: 1px solid #e5e7eb; border-radius: 4px; padding: 3px 5px; font-size: 10px; color: #1f2937; background: #f9fafb; outline: none; }
.ax-item input:focus { border-color: #6366f1; }
.color-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
.color-swatch { width: 24px; height: 24px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: all 0.12s; }
.color-swatch:hover { transform: scale(1.1); }
.color-swatch.selected { border-color: #6366f1; }
.pose-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.pose-tag { padding: 3px 8px; border: 1px solid #e5e7eb; background: #fff; color: #4b5563; border-radius: 4px; cursor: pointer; font-size: 10px; transition: all 0.12s; }
.pose-tag:hover { background: #eef2ff; border-color: #6366f1; color: #6366f1; }

.timeline-area { height: 56px; background: #fff; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
</style>