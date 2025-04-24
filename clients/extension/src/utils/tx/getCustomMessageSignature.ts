import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { WalletCore } from '@trustwallet/wallet-core'
import { isHex } from 'viem'

const ensureHexPrefix = (hex: string): string => {
  return isHex(hex) ? hex : '0x' + hex
}

const getCustomMessageSignature = (
  signature: KeysignSignature,
  walletCore: WalletCore
): Uint8Array => {
  const rData = walletCore.HexCoding.decode(signature.r)
  const sData = walletCore.HexCoding.decode(signature.s)
  const vByte = parseInt(shouldBePresent(signature.recovery_id), 16) // Convert hex string to integer
  const vData = new Uint8Array([vByte]) // Convert integer to Uint8Array

  const combinedData = new Uint8Array(rData.length + sData.length + 1)
  combinedData.set(rData)
  combinedData.set(sData, rData.length)
  combinedData.set(vData, rData.length + sData.length) // Attach `v` at the end
  return combinedData
}

export const getEncodedSignature = (
  signature: KeysignSignature,
  walletCore: WalletCore
): string => {
  return ensureHexPrefix(
    walletCore.HexCoding.encode(
      getCustomMessageSignature(signature, walletCore)
    )
  )
}
