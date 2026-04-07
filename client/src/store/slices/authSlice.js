import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// ── Thunks ────────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    // Persist tokens
    localStorage.setItem('accessToken',  data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data.data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const refreshToken = localStorage.getItem('refreshToken')
  try { await api.post('/auth/logout', { refreshToken }) } catch { /* ignore */ }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data.message
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Request failed')
  }
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/reset-password', payload)
    return data.message
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Reset failed')
  }
})

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    accessToken: localStorage.getItem('accessToken') || null,
    isLoading:   false,
    isInitialising: true,
    error:       null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
    },
    clearAuth: (state) => {
      state.user        = null
      state.accessToken = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    setInitialised: (state) => { state.isInitialising = false },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending,   (state) => { state.isLoading = true;  state.error = null })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading   = false
        state.user        = payload.user
        state.accessToken = payload.accessToken
      })
      .addCase(loginUser.rejected,  (state, { payload }) => {
        state.isLoading = false
        state.error     = payload
      })
      // Fetch me
      .addCase(fetchMe.pending,   (state) => { state.isInitialising = true })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user           = payload
        state.isInitialising = false
      })
      .addCase(fetchMe.rejected,  (state) => {
        state.user           = null
        state.accessToken    = null
        state.isInitialising = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user        = null
        state.accessToken = null
      })
  },
})

export const { setCredentials, clearAuth, setInitialised } = authSlice.actions

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCurrentUser    = (state) => state.auth.user
export const selectIsAuthenticated = (state) => !!state.auth.user
export const selectAuthLoading    = (state) => state.auth.isLoading
export const selectIsInitialising = (state) => state.auth.isInitialising
export const selectAuthError      = (state) => state.auth.error
export const selectUserRole       = (state) => state.auth.user?.role

export default authSlice.reducer
