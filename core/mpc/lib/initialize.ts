import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import initializeDkls from '@lib/dkls/vs_wasm'
import initializeSchnorr from '@lib/schnorr/vs_schnorr_wasm'
import { memoizeAsync } from '@lib/utils/memoizeAsync'

const initialize: Record<SignatureAlgorithm, () => Promise<unknown>> = {
  ecdsa: initializeDkls,
  eddsa: initializeSchnorr,
}

export const initializeMpcLib = memoizeAsync((algo: SignatureAlgorithm) =>
  initialize[algo]()
)
