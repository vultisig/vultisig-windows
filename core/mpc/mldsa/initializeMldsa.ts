import initializeMldsa from '@lib/mldsa/vs_wasm'
import { prefixErrorWith } from '@lib/utils/error/prefixErrorWith'
import { transformError } from '@lib/utils/error/transformError'
import { memoizeAsync } from '@lib/utils/memoizeAsync'

export const initializeMldsaLib = memoizeAsync(() =>
  transformError(
    initializeMldsa(),
    prefixErrorWith('Failed to initialize MLDSA lib')
  )
)
