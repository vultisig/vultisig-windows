import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import initializeDkls from '@lib/dkls/vs_wasm'
import initializeSchnorr from '@lib/schnorr/vs_schnorr_wasm'
import { prefixErrorWith } from '@lib/utils/error/prefixErrorWith'
import { transformError } from '@lib/utils/error/transformError'
import { memoizeAsync } from '@lib/utils/memoizeAsync'

const initialize: Record<SignatureAlgorithm, () => Promise<unknown>> = {
  ecdsa: initializeDkls,
  eddsa: initializeSchnorr,
}

export const initializeMpcLib = memoizeAsync((algo: SignatureAlgorithm) =>
  transformError(
    initialize[algo](),
    prefixErrorWith('Failed to initialize MPC lib')
  )
)
