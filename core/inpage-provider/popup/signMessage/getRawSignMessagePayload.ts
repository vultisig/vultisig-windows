import { hexStr2byteArray } from '@core/inpage-provider/popup/view/utils/hexStr2byteArray'
import { getCustomMessageBytes } from '@core/ui/mpc/keysign/customMessage/getCustomMessageBytes'
import { Chain, OtherChain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { hexlify, toUtf8Bytes } from 'ethers'

import { RawSignMessageInput } from '../interface'
import { getRippleMessageBytes } from './getRippleMessageBytes'
import {
  substrateRawSignChains,
  wrapSubstrateRawBytes,
} from './wrapSubstrateRawBytes'

/**
 * The `message` a raw `sign_message` request puts in the keysign payload,
 * with the chain's domain separation already applied. Co-signers sign what
 * this returns, so separation added here needs no change on other platforms.
 */
export const getRawSignMessagePayload = ({
  message,
  chain,
  useTronHeader,
  isV2,
  isHex,
}: RawSignMessageInput): string => {
  if (chain === Chain.Tron) {
    if (isV2) {
      const msgBytes = toUtf8Bytes(message)
      const tip191Header = `\x19TRON Signed Message:\n${msgBytes.length}`
      const allBytes = [...toUtf8Bytes(tip191Header), ...msgBytes]
      return hexlify(new Uint8Array(allBytes))
    }
    const tronMessageHeader = '\x19TRON Signed Message:\n32'
    const ethMessageHeader = '\x19Ethereum Signed Message:\n32'
    const messageBytes = [
      ...toUtf8Bytes(useTronHeader ? tronMessageHeader : ethMessageHeader),
      ...hexStr2byteArray(message),
    ]
    return hexlify(new Uint8Array(messageBytes))
  }
  // XRPL signs SHA-512-half of the raw message bytes (done in
  // `getCustomMessageHex`); carry those exact bytes through as hex.
  if (chain === OtherChain.Ripple) {
    return hexlify(getRippleMessageBytes({ message, isHex }))
  }
  if (isOneOf(chain, substrateRawSignChains)) {
    return hexlify(wrapSubstrateRawBytes(getCustomMessageBytes(message)))
  }
  return message
}
