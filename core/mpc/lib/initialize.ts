import { TssSignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import initializeDkls from '@lib/dkls/vs_wasm'
import initializeSchnorr from '@lib/schnorr/vs_schnorr_wasm'
import { prefixErrorWith } from '@lib/utils/error/prefixErrorWith'
import { transformError } from '@lib/utils/error/transformError'
import { memoizeAsync } from '@lib/utils/memoizeAsync'

const initialize: Record<TssSignatureAlgorithm, () => Promise<unknown>> = {
  ecdsa: initializeDkls,
  eddsa: initializeSchnorr,
}

export const initializeMpcLib = memoizeAsync((algo: TssSignatureAlgorithm) =>
  transformError(
    initialize[algo](),
    prefixErrorWith('Failed to initialize MPC lib')
  )
)
