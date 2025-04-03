import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useNavigateBack = () => {
  const navigate = useNavigate()

  return useCallback(() => navigate(-1), [navigate])
}
