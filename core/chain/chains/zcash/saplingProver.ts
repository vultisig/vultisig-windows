import { WasmSaplingProver } from 'frozt-wasm'

import { loadSaplingParams } from './saplingParams'

let proverPromise: Promise<WasmSaplingProver> | null = null

export const getSaplingProver = (): Promise<WasmSaplingProver> => {
  if (!proverPromise) {
    proverPromise = (async () => {
      const params = await loadSaplingParams()
      return new WasmSaplingProver(params.spend, params.output)
    })()
  }
  return proverPromise
}
