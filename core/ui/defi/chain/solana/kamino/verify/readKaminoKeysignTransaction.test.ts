import { create } from '@bufbuild/protobuf'
import { PublicKey } from '@solana/web3.js'
import { kaminoConfig } from '@vultisig/core-chain/chains/solana/kamino/config'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignSolanaSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { describe, expect, it } from 'vitest'

import { readKaminoKeysignTransaction } from './readKaminoKeysignTransaction'

const solanaPayload = (rawTransactions: string[]) =>
  create(KeysignPayloadSchema, {
    signData: {
      case: 'signSolana',
      value: create(SignSolanaSchema, { rawTransactions }),
    },
  })

describe('readKaminoKeysignTransaction', () => {
  it('leaves a payload that is not Solana alone', () => {
    expect(
      readKaminoKeysignTransaction(create(KeysignPayloadSchema, {}))
    ).toEqual({ unrelated: true })
  })

  it('leaves an ordinary Solana transaction alone', () => {
    const ordinary = Buffer.from('nothing to do with kamino').toString('base64')
    expect(readKaminoKeysignTransaction(solanaPayload([ordinary]))).toEqual({
      unrelated: true,
    })
  })

  it('refuses bytes that reach the kVaults program but do not decode', () => {
    // The dangerous case: describing this as an ordinary Solana transaction
    // would leave the screen silent while the signature still authorises
    // everything. The program key is present, so the coarse scan catches it
    // even though nothing here parses as a transaction.
    const mentionsProgram = Buffer.concat([
      Buffer.from('unparseable'),
      Buffer.from(new PublicKey(kaminoConfig.programId).toBytes()),
    ]).toString('base64')

    expect(
      readKaminoKeysignTransaction(solanaPayload([mentionsProgram]))
    ).toEqual({ unreadable: true })
  })

  it('refuses a batch, which no Kamino flow produces', () => {
    const mentionsProgram = Buffer.concat([
      Buffer.from(new PublicKey(kaminoConfig.programId).toBytes()),
    ]).toString('base64')

    // Two transactions cannot be summarised as one claim, and describing the
    // first would put a claim on screen that is true of only part of what
    // gets signed.
    expect(
      readKaminoKeysignTransaction(
        solanaPayload([mentionsProgram, mentionsProgram])
      )
    ).toEqual({ unreadable: true })
  })
})
