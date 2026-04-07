import { configureStore } from '@reduxjs/toolkit'
import authReducer         from './slices/authSlice'
import marksReducer        from './slices/marksSlice'
import usersReducer        from './slices/usersSlice'
import notificationsReducer from './slices/notificationsSlice'
import uiReducer           from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    marks:         marksReducer,
    users:         usersReducer,
    notifications: notificationsReducer,
    ui:            uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/PERSIST'] } }),
  devTools: import.meta.env.DEV,
})
