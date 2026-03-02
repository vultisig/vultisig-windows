import { frozt_sapling_derive_keys } from '@lib/frozt/frozt_wasm'

import { initializeFrozt } from '../../../mpc/frozt/initialize'

export const getZcashZAddress = async (
  pubKeyPackageBase64: string,
  saplingExtrasBase64: string
): Promise<string> => {
  await initializeFrozt()
  const keys = frozt_sapling_derive_keys(
    Buffer.from(pubKeyPackageBase64, 'base64'),
    Buffer.from(saplingExtrasBase64, 'base64')
  )
  return keys.address
}
