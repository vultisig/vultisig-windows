import { base64Encode } from '@lib/utils/base64Encode'

import {
  fromt_derive_spend_pub_key,
  FromtDkgSession,
  FromtKeyImportSession,
  FromtReshareSession,
  FromtSignSession,
} from '../../../lib/fromt/fromt_wasm'

export type FromtSessionHandle =
  | FromtDkgSession
  | FromtKeyImportSession
  | FromtReshareSession
  | FromtSignSession

export type FromtKeygenResult = {
  keyShare: string
  pubKey: string
}

export function parseFromtBundleResult(bundle: Uint8Array): FromtKeygenResult {
  const pubKey = fromt_derive_spend_pub_key(bundle)

  return {
    keyShare: base64Encode(bundle),
    pubKey: base64Encode(pubKey),
  }
}
