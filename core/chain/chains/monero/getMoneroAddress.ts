import { fromt_derive_address } from 'fromt-wasm'

import { initializeFromt } from '../../../mpc/fromt/initialize'

export const getMoneroAddress = async (
  keyShareBase64: string
): Promise<string> => {
  await initializeFromt()
  return fromt_derive_address(Buffer.from(keyShareBase64, 'base64'))
}
