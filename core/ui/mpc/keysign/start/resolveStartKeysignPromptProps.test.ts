import { create } from '@bufbuild/protobuf'
import { Query } from '@lib/ui/query/Query'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { createInstance } from 'i18next'
import { describe, expect, it } from 'vitest'

import { resolveStartKeysignPromptProps } from './resolveStartKeysignPromptProps'

// A real i18next instance with no resources: t(key) returns the key verbatim,
// giving an identity translator with a genuine TFunction type (no casts). The
// wording is irrelevant here — which key is chosen is the whole point.
const i18n = createInstance()
void i18n.init({ lng: 'en', resources: {} })
const t = i18n.t

const keysign = create(KeysignPayloadSchema, { memo: 'synthetic-payload' })

const pendingPayload: Query<KeysignPayload> = {
  data: undefined,
  error: null,
  isPending: true,
}

const resolvedPayload: Query<KeysignPayload> = {
  data: keysign,
  error: null,
  isPending: false,
}

const resolve = (
  input: Partial<Parameters<typeof resolveStartKeysignPromptProps>[0]> = {}
) =>
  resolveStartKeysignPromptProps({
    t,
    termsAccepted: [true],
    keysignPayloadQuery: resolvedPayload,
    isScanning: false,
    ...input,
  })

describe('resolveStartKeysignPromptProps', () => {
  it('waits on the user first, without a spinner', () => {
    expect(resolve({ termsAccepted: [true, false] })).toStrictEqual({
      disabledMessage: 'terms_required',
    })
  })

  it('reports a payload still being built as loading, never as scanning', () => {
    expect(resolve({ keysignPayloadQuery: pendingPayload })).toStrictEqual({
      disabledMessage: 'loading',
      isLoading: true,
    })
  })

  it('keeps the payload wait ahead of the scan wait', () => {
    expect(
      resolve({ keysignPayloadQuery: pendingPayload, isScanning: true })
    ).toStrictEqual({
      disabledMessage: 'loading',
      isLoading: true,
    })
  })

  it('spins the button while the security scan is in flight', () => {
    expect(resolve({ isScanning: true })).toStrictEqual({
      disabledMessage: 'scanning',
      isLoading: true,
    })
  })

  it('hands over the payload once every wait has settled', () => {
    expect(resolve()).toStrictEqual({ keysignPayload: { keysign } })
  })

  it('surfaces a build failure as the reason, without a spinner', () => {
    expect(
      resolve({
        keysignPayloadQuery: {
          data: undefined,
          error: new BuildKeysignPayloadError('not-enough-funds'),
          isPending: false,
        },
      })
    ).toStrictEqual({ disabledMessage: 'not_enough_funds' })
  })

  it('keeps an oversized TON memo disabled with the SDK explanation', () => {
    const message = 'TON memo must be at most 123 bytes (got 124).'
    expect(
      resolve({
        keysignPayloadQuery: {
          data: undefined,
          error: new BuildKeysignPayloadError('ton-memo-too-long', message),
          isPending: false,
        },
      })
    ).toStrictEqual({ disabledMessage: message })
  })
})
