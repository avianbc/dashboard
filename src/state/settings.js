import { signal, computed, effect } from '@preact/signals'

// Unit system: 'imperial' | 'metric'
export const unit = signal(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('unit') || 'imperial'
    : 'imperial'
)

// Theme: 'light' | 'dark' | 'auto'
export const theme = signal(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('theme') || 'auto'
    : 'auto'
)

// Derived state
export const isMetric = computed(() => unit.value === 'metric')

// Persist to localStorage
if (typeof localStorage !== 'undefined') {
  effect(() => {
    localStorage.setItem('unit', unit.value)
  })

  effect(() => {
    localStorage.setItem('theme', theme.value)
    applyTheme(theme.value)
  })
}

// Apply theme to document
function applyTheme(themeValue) {
  if (typeof document === 'undefined') return

  if (themeValue === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', themeValue)
  }
}

// Initialize theme on load
if (typeof document !== 'undefined') {
  applyTheme(theme.value)
}

// Toggle functions
export function toggleUnit() {
  unit.value = unit.value === 'imperial' ? 'metric' : 'imperial'
}

export function toggleTheme() {
  const themes = ['auto', 'light', 'dark']
  const currentIndex = themes.indexOf(theme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  theme.value = themes[nextIndex]
}

export function setTheme(newTheme) {
  if (['light', 'dark', 'auto'].includes(newTheme)) {
    theme.value = newTheme
  }
}

export function setUnit(newUnit) {
  if (['imperial', 'metric'].includes(newUnit)) {
    unit.value = newUnit
  }
}
