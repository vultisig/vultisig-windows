import { create } from '@bufbuild/protobuf'
import { toBase64 } from '@cosmjs/encoding'
import { Chain } from '@vultisig/core-chain/Chain'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  SignAminoSchema,
  SignDirectSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { AuthInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { getNonNativeDappCosmosFeeDisplay } from './dappCosmosFee'

const payloadWithSignAminoFee = (amount: { denom: string; amount: string }[]) =>
  create(KeysignPayloadSchema, {
    signData: {
      case: 'signAmino',
      value: create(SignAminoSchema, {
        fee: { amount, gas: '200000' },
      }),
    },
  })

const payloadWithSignAminoExecuteFee = (
  amount: { denom: string; amount: string }[]
) =>
  create(KeysignPayloadSchema, {
    signData: {
      case: 'signAmino',
      value: create(SignAminoSchema, {
        fee: { amount, gas: '200000' },
        msgs: [{ type: CosmosMsgType.MSG_EXECUTE_CONTRACT, value: '{}' }],
      }),
    },
  })

const payloadWithSignDirectFee = (
  amount: { denom: string; amount: string }[]
) =>
  create(KeysignPayloadSchema, {
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, {
        authInfoBytes: toBase64(
          AuthInfo.encode(
            AuthInfo.fromPartial({
              fee: {
                amount,
                gasLimit: 200000n,
              },
              signerInfos: [],
            })
          ).finish()
        ),
      }),
    },
  })

describe('getNonNativeDappCosmosFeeDisplay', () => {
  it('returns null when a Cosmos dApp fee uses only the chain native denom', () => {
    expect(
      getNonNativeDappCosmosFeeDisplay({
        keysignPayload: payloadWithSignAminoFee([
          { denom: 'uatom', amount: '1200' },
        ]),
        chain: Chain.Cosmos,
      })
    ).toBeNull()
  })

  it('surfaces the signed signAmino fee when it uses a non-native denom', () => {
    expect(
      getNonNativeDappCosmosFeeDisplay({
        keysignPayload: payloadWithSignAminoFee([
          { denom: 'ibc/ABC123', amount: '4500' },
        ]),
        chain: Chain.Cosmos,
      })
    ).toBe('4500 ibc/ABC123')
  })

  it('surfaces every signed fee entry when any denom is non-native', () => {
    expect(
      getNonNativeDappCosmosFeeDisplay({
        keysignPayload: payloadWithSignDirectFee([
          { denom: 'uatom', amount: '1200' },
          { denom: 'ibc/ABC123', amount: '4500' },
        ]),
        chain: Chain.Cosmos,
      })
    ).toBe('1200 uatom + 4500 ibc/ABC123')
  })

  it('keeps vault-based non-contract dApp fee display on the actual chain fee', () => {
    expect(
      getNonNativeDappCosmosFeeDisplay({
        keysignPayload: payloadWithSignAminoFee([
          { denom: 'ibc/ABC123', amount: '4500' },
        ]),
        chain: Chain.THORChain,
      })
    ).toBeNull()
  })

  it('surfaces vault-based execute-contract dApp fees when they are paid by the tx', () => {
    expect(
      getNonNativeDappCosmosFeeDisplay({
        keysignPayload: payloadWithSignAminoExecuteFee([
          { denom: 'ibc/ABC123', amount: '4500' },
        ]),
        chain: Chain.THORChain,
      })
    ).toBe('4500 ibc/ABC123')
  })
})
