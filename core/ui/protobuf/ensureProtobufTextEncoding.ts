import { configureTextEncoding, getTextEncoding } from '@bufbuild/protobuf/wire'

/**
 * protobuf-es keeps one text-encoding provider on `globalThis`, keyed by a
 * shared symbol, and `BinaryWriter` reads `encodeUtf8Into` off it. The SDK
 * bundle inlines an older protobuf-es whose provider has no `encodeUtf8Into`;
 * when that copy registers first — the swap flow runs SDK code before the
 * keysign message is encoded — `toBinary` throws "encodeUtf8Into is not a
 * function" and the keysign QR code fails to generate. Registering ours first
 * (or completing an existing provider) keeps both copies working.
 */
export const ensureProtobufTextEncoding = () => {
  const textEncoding = getTextEncoding()
  if (typeof textEncoding.encodeUtf8Into !== 'function') {
    configureTextEncoding(textEncoding)
  }
}
