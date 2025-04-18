import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  CorePath,
  CorePathParams,
  CorePathState,
  CorePathsWithNoParamsOrState,
  CorePathsWithOnlyParams,
  CorePathsWithOnlyState,
  CorePathsWithParamsAndState,
  makeCorePath,
} from '..'

type CommonOptions = { replace?: boolean }

type CoreNavigate = {
  <P extends CorePathsWithParamsAndState>(
    path: P,
    options: CommonOptions & {
      params: CorePathParams[P]
      state: CorePathState[P]
    }
  ): void
  <P extends CorePathsWithOnlyParams>(
    path: P,
    options: CommonOptions & { params: CorePathParams[P] }
  ): void
  <P extends CorePathsWithOnlyState>(
    path: P,
    options: CommonOptions & { state: CorePathState[P] }
  ): void
  (path: CorePathsWithNoParamsOrState, options?: CommonOptions): void
}

export function useCoreNavigate(): CoreNavigate {
  const navigate = useNavigate()
  const coreNavigate = useCallback(
    (path: CorePath, { params, ...options }: any = {}) => {
      const to = params
        ? makeCorePath(path as any, params)
        : makeCorePath(path as any)

      navigate(to, options)
    },
    [navigate]
  )

  return coreNavigate as CoreNavigate
}
