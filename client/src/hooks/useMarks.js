/**
 * hooks/useMarks.js — Marks data hook
 */
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSectionMarks,
  fetchMyMarks,
  saveMarks,
  submitMarksForApproval,
  approveMarks,
  selectSectionMarks,
  selectMyMarks,
  selectMarksLoading,
  selectMarksSaving,
} from '../store/slices/marksSlice'
import toast from 'react-hot-toast'

export function useMarks() {
  const dispatch = useDispatch()

  const sectionMarks = useSelector(selectSectionMarks)
  const myMarks      = useSelector(selectMyMarks)
  const isLoading    = useSelector(selectMarksLoading)
  const isSaving     = useSelector(selectMarksSaving)

  const loadSectionMarks = useCallback((params) => {
    return dispatch(fetchSectionMarks(params))
  }, [dispatch])

  const loadMyMarks = useCallback((params) => {
    return dispatch(fetchMyMarks(params))
  }, [dispatch])

  const saveStudentMarks = useCallback(async (payload) => {
    const res = await dispatch(saveMarks(payload))
    if (!res.error) toast.success('Marks saved')
    return res
  }, [dispatch])

  const submitForApproval = useCallback(async (payload) => {
    const res = await dispatch(submitMarksForApproval(payload))
    if (!res.error) toast.success('Marks submitted for approval')
    return res
  }, [dispatch])

  const approveStudentMarks = useCallback(async (payload) => {
    const res = await dispatch(approveMarks(payload))
    if (!res.error) toast.success('Marks approved successfully')
    return res
  }, [dispatch])

  return {
    sectionMarks,
    myMarks,
    isLoading,
    isSaving,
    loadSectionMarks,
    loadMyMarks,
    saveStudentMarks,
    submitForApproval,
    approveStudentMarks,
  }
}
