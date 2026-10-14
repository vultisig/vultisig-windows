import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

const utf8Decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })

/**
 * The custom message string that `getCustomMessageBytes` reads back as
 * exactly these bytes. Valid UTF-8 stays text, so the popup and co-signers
 * show it as written; anything else, and text that itself starts with `0x`,
 * goes as hex.
 */
export const toCustomMessage = (bytes: Uint8Array): string => {
  const text = withFallback(
    attempt((): string | null => utf8Decoder.decode(bytes)),
    null
  )

  return text !== null && !text.startsWith('0x')
    ? text
    : `0x${Buffer.from(bytes).toString('hex')}`
}
