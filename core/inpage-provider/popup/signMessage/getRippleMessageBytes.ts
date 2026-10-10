import { getBytes, toUtf8Bytes } from 'ethers'

type GetRippleMessageBytesInput = {
  message: string
  isHex?: boolean
}

/**
 * Raw message bytes for an XRPL `signMessage`, mirroring GemWallet: a hex
 * string is decoded verbatim, otherwise the text is UTF-8 encoded. Throws on
 * malformed hex.
 */
export const getRippleMessageBytes = ({
  message,
  isHex,
}: GetRippleMessageBytesInput): Uint8Array =>
  isHex
    ? getBytes(
        message.startsWith('0x') || message.startsWith('0X')
          ? message
          : `0x${message}`
      )
    : toUtf8Bytes(message)
