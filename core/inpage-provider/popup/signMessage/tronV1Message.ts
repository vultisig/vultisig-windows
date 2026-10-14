import { hexStr2byteArray } from '@core/inpage-provider/popup/view/utils/hexStr2byteArray'

// TronWeb's `isHex`, which `trx.sign` requires of a message string.
const tronHexMessagePattern = /^(0x|)[a-fA-F0-9]+$/

/** Whether a TronWeb v1 `signMessage` string is hex TronWeb itself would sign. */
export const isTronV1HexMessage = (message: string) =>
  tronHexMessagePattern.test(message)

/**
 * Bytes of a TronWeb v1 `signMessage` string, mirroring TronWeb's
 * `signString`: an optional `0x` prefix is dropped and the rest is decoded as
 * hex. Throws on anything `isTronV1HexMessage` rejects.
 */
export const getTronV1MessageBytes = (message: string) =>
  hexStr2byteArray(message.replace(/^0x/, ''))
