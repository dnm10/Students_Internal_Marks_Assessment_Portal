import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchSectionMarks = createAsyncThunk('marks/fetchSection', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/marks/section', { params })
    return data.data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchStudentMarks = createAsyncThunk('marks/fetchStudent', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/marks/student/${params.studentId || ''}`, { params })
    return data.data.rows
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchMyMarks = createAsyncThunk('marks/fetchMyMarks', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/marks/me', { params })
    return data.data.rows
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const saveMarks = createAsyncThunk('marks/save', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/marks', payload)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const submitMarksForApproval = createAsyncThunk('marks/submit', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/marks/submit', payload)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const approveMarks = createAsyncThunk('marks/approve', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/marks/approve', payload)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const marksSlice = createSlice({
  name: 'marks',
  initialState: {
    sectionMarks: [],
    myMarks:      [],
    lockConfig:   null,
    isLoading:    false,
    isSaving:     false,
    error:        null,
  },
  reducers: {
    clearMarksError: (state) => { state.error = null },
    updateLocalMark: (state, { payload }) => {
      const idx = state.sectionMarks.findIndex(m => m.student_id === payload.studentId)
      if (idx !== -1) state.sectionMarks[idx] = { ...state.sectionMarks[idx], ...payload.values }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSectionMarks.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(fetchSectionMarks.fulfilled, (s, { payload }) => {
        s.isLoading    = false
        s.sectionMarks = payload.rows
        s.lockConfig   = payload.lockConfig
      })
      .addCase(fetchSectionMarks.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload })

      .addCase(fetchMyMarks.pending,   (s) => { s.isLoading = true })
      .addCase(fetchMyMarks.fulfilled, (s, { payload }) => { s.isLoading = false; s.myMarks = payload })
      .addCase(fetchMyMarks.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload })

      .addCase(fetchStudentMarks.fulfilled, (s, { payload }) => { s.myMarks = payload })

      .addCase(saveMarks.pending,   (s) => { s.isSaving = true })
      .addCase(saveMarks.fulfilled, (s) => { s.isSaving = false })
      .addCase(saveMarks.rejected,  (s, { payload }) => { s.isSaving = false; s.error = payload })
  },
})

export const { clearMarksError, updateLocalMark } = marksSlice.actions
export const selectSectionMarks = (state) => state.marks.sectionMarks
export const selectMyMarks      = (state) => state.marks.myMarks
export const selectMarksLoading = (state) => state.marks.isLoading
export const selectMarksSaving  = (state) => state.marks.isSaving
export default marksSlice.reducer
