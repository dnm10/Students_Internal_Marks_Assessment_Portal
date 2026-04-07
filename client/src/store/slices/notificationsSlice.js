import { createSlice } from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    addNotification: (state, { payload }) => {
      state.items.unshift({ ...payload, id: Date.now(), isRead: false })
      state.unreadCount++
    },
    markRead: (state, { payload }) => {
      const n = state.items.find(i => i.id === payload)
      if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1) }
    },
    markAllRead: (state) => {
      state.items.forEach(i => { i.isRead = true })
      state.unreadCount = 0
    },
    setNotifications: (state, { payload }) => {
      state.items = payload
      state.unreadCount = payload.filter(n => !n.isRead).length
    },
  },
})

export const { addNotification, markRead, markAllRead, setNotifications } = notificationsSlice.actions
export const selectNotifications = (state) => state.notifications.items
export const selectUnreadCount   = (state) => state.notifications.unreadCount
export default notificationsSlice.reducer
