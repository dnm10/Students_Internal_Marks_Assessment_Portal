/**
 * hooks/useAttendance.js — Attendance data hook
 */
import { useState, useCallback } from 'react'
import api   from '../utils/api'
import toast from 'react-hot-toast'

export function useAttendance() {
  const [data,    setData]    = useState([])
  const [summary, setSummary] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const loadSectionAttendance = useCallback(async (params) => {
    setIsLoading(true)
    try {
      const { data: res } = await api.get('/attendance/section', { params })
      setData(res.data.rows || [])
    } catch {} finally { setIsLoading(false) }
  }, [])

  const loadSummary = useCallback(async (params) => {
    setIsLoading(true)
    try {
      const { data: res } = await api.get('/attendance/section/summary', { params })
      setSummary(res.data.rows || [])
    } catch {} finally { setIsLoading(false) }
  }, [])

  const markAttendance = useCallback(async (payload) => {
    setIsLoading(true)
    try {
      await api.post('/attendance', payload)
      toast.success(`Attendance saved for ${payload.attendance.length} students`)
      return true
    } catch {
      return false
    } finally { setIsLoading(false) }
  }, [])

  const loadMyAttendance = useCallback(async (params) => {
    setIsLoading(true)
    try {
      const { data: res } = await api.get('/attendance/me', { params })
      setData(res.data.rows || [])
    } catch {} finally { setIsLoading(false) }
  }, [])

  return {
    data,
    summary,
    isLoading,
    loadSectionAttendance,
    loadSummary,
    markAttendance,
    loadMyAttendance,
  }
}
