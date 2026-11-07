import { create } from '@bufbuild/protobuf'
import { unknownTxHash } from '@core/ui/chain/tx/unknownTxHash'
import { CosmosSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignAminoSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { describe, expect, it } from 'vitest'

import { getCosmosDAppTxHash } from './getCosmosDAppTxHash'

// Cosmos Hub tx 5FAB18FB…169D, an amino-signed MsgSend.
const onChainAminoSend = {
  txHash: '5FAB18FB6AB5FD75A3A3B4F8C3DFF307F486664AD09EC5F2F73D034D5C9E169D',
  hexPublicKey:
    '020f63c2c2c9a11e541adf37e657555984ded2257f5e406e14f1d61da869071048',
  pubKeyBase64: 'Ag9jwsLJoR5UGt835ldVWYTe0iV/XkBuFPHWHahpBxBI',
  sequence: 71634n,
  signature:
    'NWTn4Dg4R/S3luVemjmJuS5NJ3vbm7s63Z5GqIXZgNojV50ROzJQJrIFluQTSh3n2TlViUiBgIkRiXqA6NJ0DQ==',
  msgSend: {
    type: 'cosmos-sdk/MsgSend',
    value: {
      from_address: 'cosmos13dd5eahz5xkytny9dqnpre7488hm7ahsnadr3w',
      to_address: 'cosmos1sav9eq38eyhj89f3xyxmn3fstrs8gnvq7qasdx',
      amount: [{ denom: 'uatom', amount: '6040657' }],
    },
  },
}

const unregisteredMessage = {
  type: 'some-module/some-message',
  value: { sender: 'osmo1sav9eq38eyhj89f3xyxmn3fstrs8gnvqk0nt6e' },
}

type AminoMsg = { type: string; value: Record<string, unknown> }

const keysignPayload = (skipBroadcast: boolean) =>
  create(KeysignPayloadSchema, {
    skipBroadcast,
    coin: create(CoinSchema, { hexPublicKey: onChainAminoSend.hexPublicKey }),
    blockchainSpecific: {
      case: 'cosmosSpecific',
      value: create(CosmosSpecificSchema, {
        sequence: onChainAminoSend.sequence,
      }),
    },
    signData: { case: 'signAmino', value: create(SignAminoSchema, {}) },
  })

const signedAminoJson = (msg: AminoMsg[]) =>
  JSON.stringify({
    tx: {
      msg,
      fee: { amount: [{ denom: 'uatom', amount: '20000' }], gas: '250000' },
      memo: '',
      signatures: [
        {
          pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: onChainAminoSend.pubKeyBase64,
          },
          signature: onChainAminoSend.signature,
        },
      ],
    },
  })

describe('getCosmosDAppTxHash', () => {
  const hashOf = (skipBroadcast: boolean, msg: AminoMsg[]) =>
    getCosmosDAppTxHash({
      keysignPayload: keysignPayload(skipBroadcast),
      signedAminoJson: signedAminoJson(msg),
      signatureBytes: undefined,
    })

  it.each([true, false])(
    'rebuilds the hash the chain recorded for an amino-signed MsgSend (skipBroadcast: %s)',
    skipBroadcast => {
      expect(hashOf(skipBroadcast, [onChainAminoSend.msgSend])).toBe(
        onChainAminoSend.txHash
      )
    }
  )

  it('records an unknown hash when the dApp broadcasts a message it cannot rebuild', () => {
    expect(hashOf(true, [onChainAminoSend.msgSend, unregisteredMessage])).toBe(
      unknownTxHash
    )
  })

  it('still throws when this client broadcasts a message it cannot rebuild', () => {
    expect(() => hashOf(false, [unregisteredMessage])).toThrow(
      "Amino type identifier 'some-module/some-message'"
    )
  })
})
