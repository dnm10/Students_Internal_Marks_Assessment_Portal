import { createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('theme') || 'dark';

// Apply initial theme immediately to avoid flicker, since we are reading from localStorage
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
  document.documentElement.classList.remove('light')
} else {
  document.documentElement.classList.add('light')
  document.documentElement.classList.remove('dark')
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:    true,
    sidebarCollapsed: false,
    theme:          savedTheme, // 'dark' | 'light'
    activeModal:    null,
    breadcrumbs:    [],
  },
  reducers: {
    toggleSidebar:    (s) => { s.sidebarOpen = !s.sidebarOpen },
    setSidebarOpen:   (s, { payload }) => { s.sidebarOpen = payload },
    toggleCollapse:   (s) => { s.sidebarCollapsed = !s.sidebarCollapsed },
    toggleTheme:      (s) => {
      s.theme = s.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', s.theme)
      document.documentElement.classList.toggle('dark', s.theme === 'dark')
      document.documentElement.classList.toggle('light', s.theme === 'light')
    },
    openModal:        (s, { payload }) => { s.activeModal = payload },
    closeModal:       (s) => { s.activeModal = null },
    setBreadcrumbs:   (s, { payload }) => { s.breadcrumbs = payload },
  },
})

export const { toggleSidebar, setSidebarOpen, toggleCollapse, toggleTheme, openModal, closeModal, setBreadcrumbs } = uiSlice.actions
export const selectSidebarOpen      = (s) => s.ui.sidebarOpen
export const selectSidebarCollapsed = (s) => s.ui.sidebarCollapsed
export const selectTheme            = (s) => s.ui.theme
export const selectActiveModal      = (s) => s.ui.activeModal
export default uiSlice.reducer
