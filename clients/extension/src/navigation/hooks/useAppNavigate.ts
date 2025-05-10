import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppPath, makeAppPath } from '..'

type CommonOptions = { replace?: boolean }

type AppNavigate = {
  (path: AppPath, options?: CommonOptions): void
}

export function useAppNavigate(): AppNavigate {
  const navigate = useNavigate()
  const appNavigate = useCallback(
    (path: AppPath, { params, ...options }: any = {}) => {
      const to = params
        ? makeAppPath(path as any, params)
        : makeAppPath(path as any)

      navigate(to, options)
    },
    [navigate]
  )
  return appNavigate as AppNavigate
}
