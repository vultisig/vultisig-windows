import { fromBinary, toBinary } from '@bufbuild/protobuf'
import { CustomMessagePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { describe, expect, it } from 'vitest'

import { buildManualCustomMessagePayload } from './buildManualCustomMessagePayload'

const payload = buildManualCustomMessagePayload({
  method: 'personal_sign',
  message: 'hello',
  vaultPublicKeyEcdsa: 'vault-id',
})

describe('buildManualCustomMessagePayload', () => {
  it('carries the typed-in method and message', () => {
    expect(payload).toMatchObject({
      method: 'personal_sign',
      message: 'hello',
      vaultPublicKeyEcdsa: 'vault-id',
    })
  })

  // A message the user typed has no requesting dApp, so co-signers must not be
  // shown a "request from" banner for it.
  it('leaves the dApp identity unset, as built and as decoded by a co-signer', () => {
    expect(payload.dappMetadata).toBeUndefined()

    const decoded = fromBinary(
      CustomMessagePayloadSchema,
      toBinary(CustomMessagePayloadSchema, payload)
    )

    expect(decoded.dappMetadata).toBeUndefined()
  })
})
