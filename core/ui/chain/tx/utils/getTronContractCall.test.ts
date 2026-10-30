import { create } from '@bufbuild/protobuf'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  TronTransferContractPayloadSchema,
  TronTriggerSmartContractPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/tron_contract_payload_pb'
import { describe, expect, it } from 'vitest'

import { getTronContractCall } from './getTronContractCall'

const usdt = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
const approveData = `095ea7b3${'22'.repeat(20).padStart(64, '0')}${'f'.repeat(64)}`

const withContractPayload = (
  contractPayload: KeysignPayload['contractPayload']
) => create(KeysignPayloadSchema, { contractPayload })

describe('getTronContractCall', () => {
  it('returns the 0x-prefixed calldata and the contract it targets', () => {
    expect(
      getTronContractCall(
        withContractPayload({
          case: 'tronTriggerSmartContractPayload',
          value: create(TronTriggerSmartContractPayloadSchema, {
            contractAddress: usdt,
            data: approveData,
          }),
        })
      )
    ).toEqual({ data: `0x${approveData}`, contractAddress: usdt })
  })

  it('returns nothing for a contract call without data', () => {
    expect(
      getTronContractCall(
        withContractPayload({
          case: 'tronTriggerSmartContractPayload',
          value: create(TronTriggerSmartContractPayloadSchema, {
            contractAddress: usdt,
          }),
        })
      )
    ).toBeUndefined()
  })

  it('returns nothing for a payload that is not a contract call', () => {
    expect(
      getTronContractCall(
        withContractPayload({
          case: 'tronTransferContractPayload',
          value: create(TronTransferContractPayloadSchema, { amount: '1' }),
        })
      )
    ).toBeUndefined()
    expect(getTronContractCall(create(KeysignPayloadSchema))).toBeUndefined()
  })
})
