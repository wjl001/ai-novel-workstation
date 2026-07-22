import { defineStore } from 'pinia'

export type AppTheme = 'light' | 'dark'

const STORAGE_KEY = 'app-theme'

const getStoredTheme = (): AppTheme => {
  const storedTheme = localStorage.getItem(STORAGE_KEY)
  return storedTheme === 'dark' ? 'dark' : 'light'
}

const applyThemeToDocument = (theme: AppTheme) => {
  const root = document.documentElement
  const body = document.body
  const isDark = theme === 'dark'

  root.classList.toggle('dark', isDark)
  root.setAttribute('data-theme', theme)
  body?.classList.toggle('dark', isDark)
  body?.setAttribute('data-theme', theme)
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' as AppTheme
  }),
  getters: {
    isLight: (state) => state.theme === 'light',
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    initializeTheme() {
      this.theme = getStoredTheme()
      applyThemeToDocument(this.theme)
    },
    setTheme(theme: AppTheme) {
      this.theme = theme
      localStorage.setItem(STORAGE_KEY, theme)
      applyThemeToDocument(theme)
    },
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    }
  }
})
