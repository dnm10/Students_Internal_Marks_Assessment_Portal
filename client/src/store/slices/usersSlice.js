import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchUsers = createAsyncThunk('users/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users', { params })
    return data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchSystemStats = createAsyncThunk('users/stats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/stats')
    return data.data.stats
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createUser = createAsyncThunk('users/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/users', payload)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateUser = createAsyncThunk('users/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/users/${id}`, payload)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/users/${id}`)
    return { id, ...data }
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    rows:      [],
    total:     0,
    stats:     null,
    isLoading: false,
    error:     null,
  },
  reducers: {
    clearUsersError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(fetchUsers.fulfilled, (s, { payload }) => { s.isLoading = false; s.rows = payload.rows; s.total = payload.total })
      .addCase(fetchUsers.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload })
      .addCase(fetchSystemStats.fulfilled, (s, { payload }) => { s.stats = payload })
      .addCase(deleteUser.fulfilled, (s, { payload }) => { s.rows = s.rows.filter(u => u.id !== payload.id) })
  },
})

export const { clearUsersError } = usersSlice.actions
export const selectUsers       = (state) => state.users.rows
export const selectUsersTotal  = (state) => state.users.total
export const selectSystemStats = (state) => state.users.stats
export const selectUsersLoading = (state) => state.users.isLoading
export default usersSlice.reducer
