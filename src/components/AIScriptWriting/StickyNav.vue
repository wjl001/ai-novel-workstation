<template>
  <transition name="fade">
    <div 
      v-show="visible"
      class="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2 p-2 rounded-2xl backdrop-blur-md border shadow-lg transition-colors duration-300"
      :class="isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-700'"
    >
      <div 
        v-for="item in items" 
        :key="item.id"
        class="group relative flex items-center justify-end px-2 py-1.5 cursor-pointer"
        @click="scrollTo(item.id)"
      >
        <!-- Label (Hidden by default, shown on hover/active) -->
        <span 
          class="absolute right-8 text-xs font-bold whitespace-nowrap px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
          :class="[
            activeId === item.id ? '!opacity-100 !translate-x-0' : '',
            isLight ? 'bg-white text-slate-700 shadow-sm border border-slate-100' : 'bg-slate-800 text-slate-200 border border-slate-700'
          ]"
        >
          {{ item.label }}
        </span>

        <!-- Dot indicator -->
        <div 
          class="w-2.5 h-2.5 rounded-full transition-all duration-300 border"
          :class="[
            activeId === item.id 
              ? (isLight ? 'bg-indigo-500 border-indigo-500 scale-125' : 'bg-indigo-400 border-indigo-400 scale-125') 
              : (isLight ? 'bg-slate-300 border-transparent group-hover:bg-slate-400' : 'bg-slate-600 border-transparent group-hover:bg-slate-500')
          ]"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'

const isLight = inject('isLight', ref(false))

interface NavItem {
  id: string
  label: string
}

const props = defineProps<{
  items: NavItem[]
}>()

const visible = ref(true)
const activeId = ref('')

// Throttled scroll handler
let scrollTimeout: any = null

const handleScroll = () => {
  if (scrollTimeout) return
  scrollTimeout = setTimeout(() => {
    scrollTimeout = null
    
    // Find the current active section
    // Logic: The section that takes up the most space in the viewport, or the first one near the top
    const viewportHeight = window.innerHeight
    let maxVisibleRatio = 0
    let currentActive = ''

    for (const item of props.items) {
      const el = document.getElementById(item.id)
      if (el) {
        const rect = el.getBoundingClientRect()
        
        // Calculate intersection ratio
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
        const ratio = Math.max(0, visibleHeight / rect.height)

        // Priority to element crossing the "reading line" (top 1/3 of screen)
        if (rect.top < viewportHeight * 0.3 && rect.bottom > viewportHeight * 0.3) {
           currentActive = item.id
           break
        }
      }
    }
    
    if (currentActive) activeId.value = currentActive
  }, 100)
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
    
    // Add highlight animation
    el.classList.add('highlight-section')
    setTimeout(() => {
      el.classList.remove('highlight-section')
    }, 2000)
  }
}

onMounted(() => {
  // Try to find the scroll container. In AIWriteNovel.vue, it's the direct parent or window.
  // The structure shows <div class="h-full overflow-y-auto ..."> as the scroll container for the page content.
  // We need to attach listener to that specific container.
  // We'll rely on window scroll if body scrolls, but here it seems a div scrolls.
    // Let's attach to window for safety, but we might need to be passed the scroll container ref.
    // Actually, standard approach is window, but since this is a "workbench" layout, usually an inner div scrolls.
    // I will assume the parent handles the scroll listener or I attach to a selector.
    
    const scrollContainer = document.getElementById('scroll-container') || document.querySelector('.overflow-y-auto.scrollbar-thin')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
    } else {
      window.addEventListener('scroll', handleScroll)
    }
    handleScroll()
  })
  
  onUnmounted(() => {
    const scrollContainer = document.getElementById('scroll-container') || document.querySelector('.overflow-y-auto.scrollbar-thin')
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', handleScroll)
    } else {
      window.removeEventListener('scroll', handleScroll)
    }
  })
  
  // Expose nav items for parent if needed
  // const navItems = ref(props.items) // Use props directly in template
  </script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>