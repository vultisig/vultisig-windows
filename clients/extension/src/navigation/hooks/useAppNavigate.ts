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
    (path: AppPath, options: any = {}) => {
      const to = makeAppPath(path as never)

      navigate(to, options)
    },
    [navigate]
  )

  return appNavigate as AppNavigate
}
