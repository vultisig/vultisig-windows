import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

export const corePaths = {
  vault: '/vault',
} as const

type CorePaths = typeof corePaths
export type CorePath = keyof CorePaths

export type CorePathParams = {}

export type CorePathState = {}

type CorePathsWithParams = keyof CorePathParams

type CorePathsWithState = keyof CorePathState

export type CorePathsWithParamsAndState = Extract<
  CorePathsWithParams,
  CorePathsWithState
>
export type CorePathsWithOnlyParams = Exclude<
  CorePathsWithParams,
  CorePathsWithParamsAndState
>
export type CorePathsWithOnlyState = Exclude<
  CorePathsWithState,
  CorePathsWithParamsAndState
>
export type CorePathsWithNoParamsOrState = Exclude<
  CorePath,
  CorePathsWithParams | CorePathsWithState
>

export function makeCorePath<P extends keyof CorePathParams>(
  path: P,
  variables: CorePathParams[P]
): string
export function makeCorePath<P extends Exclude<CorePath, keyof CorePathParams>>(
  path: P
): string
export function makeCorePath(path: CorePath, variables?: any): string {
  const basePath = corePaths[path]
  if (variables) {
    return addQueryParams(basePath, withoutUndefinedFields(variables))
  } else {
    return basePath
  }
}
