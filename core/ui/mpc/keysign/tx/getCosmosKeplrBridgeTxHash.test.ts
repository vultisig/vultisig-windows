import { create } from '@bufbuild/protobuf'
import { fromBase64, toHex } from '@cosmjs/encoding'
import { CosmosSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignAminoSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { describe, expect, it } from 'vitest'

import { getCosmosKeplrBridgeTxHash } from './getCosmosKeplrBridgeTxHash'

// Cosmos Hub tx 1C88BC8C…E493D, an amino IBC MsgTransfer with a tx-level timeout_height.
const onChainIbcDeposit = {
  txHash: '1C88BC8C3B0479AF02BC2657EE3D9011D3DE13EB10E5E5E9C96231AC2CBE493D',
  pubKeyBase64: 'A/hAKS6gGUYgPbphey7dmJ5Vigi/sCsor0PdwGV/3rT7',
  sequence: 14n,
  timeoutHeight: 33737590n,
  signature:
    'n9jwriKg8y+2LfF/dvGSWTaDlHum4Sr1i8axRNFZ+7Vh+zuvae6DP5rjh+vGxgXoSlGym29oU8SE0FnqOmbWzA==',
  msgTransfer: {
    type: 'cosmos-sdk/MsgTransfer',
    value: {
      receiver: 'osmo16nu2a3ty3uj56x7xsujss76h2sk6hgtt4j5fez',
      sender: 'cosmos16nu2a3ty3uj56x7xsujss76h2sk6hgttaf8e0s',
      source_channel: 'channel-141',
      source_port: 'transfer',
      timeout_height: { revision_height: '74181662', revision_number: '1' },
      token: { amount: '330140', denom: 'uatom' },
    },
  },
}

describe('getCosmosKeplrBridgeTxHash', () => {
  it('rebuilds the hash the chain recorded for an amino tx with a timeout_height', () => {
    const { msgTransfer, pubKeyBase64, signature } = onChainIbcDeposit
    const fee = { amount: [{ amount: '5802', denom: 'uatom' }], gas: '193367' }

    const hash = getCosmosKeplrBridgeTxHash({
      keysignPayload: create(KeysignPayloadSchema, {
        skipBroadcast: true,
        coin: create(CoinSchema, {
          hexPublicKey: toHex(fromBase64(pubKeyBase64)),
        }),
        blockchainSpecific: {
          case: 'cosmosSpecific',
          value: create(CosmosSpecificSchema, {
            sequence: onChainIbcDeposit.sequence,
          }),
        },
        signData: {
          case: 'signAmino',
          value: create(SignAminoSchema, {
            fee,
            timeoutHeight: onChainIbcDeposit.timeoutHeight,
          }),
        },
      }),
      signedAminoJson: JSON.stringify({
        tx: {
          msg: [msgTransfer],
          fee,
          memo: 'OsmosisFE',
          signatures: [
            {
              pub_key: {
                type: 'tendermint/PubKeySecp256k1',
                value: pubKeyBase64,
              },
              signature,
            },
          ],
        },
      }),
      signatureBytes: undefined,
    })

    expect(hash).toBe(onChainIbcDeposit.txHash)
  })
})
