import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { decodeCosmosMessageValue } from './decodeCosmosMessageValue'

describe('decodeCosmosMessageValue', () => {
  it('decodes /cosmos.bank.v1beta1.MsgSend with named fields', () => {
    const encoded = MsgSend.encode({
      fromAddress: 'cosmos1aaa',
      toAddress: 'cosmos1bbb',
      amount: [{ denom: 'uatom', amount: '12345' }],
    }).finish()

    const result = decodeCosmosMessageValue({
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: encoded,
    })

    expect(result).toEqual({
      fromAddress: 'cosmos1aaa',
      toAddress: 'cosmos1bbb',
      amount: [{ denom: 'uatom', amount: '12345' }],
    })
  })

  it('decodes /cosmos.staking.v1beta1.MsgDelegate', () => {
    const encoded = MsgDelegate.encode({
      delegatorAddress: 'osmo1abc',
      validatorAddress: 'osmovaloper1xyz',
      amount: { denom: 'uosmo', amount: '1000000' },
    }).finish()

    const result = decodeCosmosMessageValue({
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: encoded,
    })

    expect(result).toEqual({
      delegatorAddress: 'osmo1abc',
      validatorAddress: 'osmovaloper1xyz',
      amount: { denom: 'uosmo', amount: '1000000' },
    })
  })

  it('decodes /cosmos.staking.v1beta1.MsgUndelegate', () => {
    const encoded = MsgUndelegate.encode({
      delegatorAddress: 'osmo1abc',
      validatorAddress: 'osmovaloper1xyz',
      amount: { denom: 'uosmo', amount: '500000' },
    }).finish()

    const result = decodeCosmosMessageValue({
      typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
      value: encoded,
    })

    expect(result).toEqual({
      delegatorAddress: 'osmo1abc',
      validatorAddress: 'osmovaloper1xyz',
      amount: { denom: 'uosmo', amount: '500000' },
    })
  })

  it('decodes /cosmos.staking.v1beta1.MsgBeginRedelegate', () => {
    const encoded = MsgBeginRedelegate.encode({
      delegatorAddress: 'osmo1abc',
      validatorSrcAddress: 'osmovaloper1src',
      validatorDstAddress: 'osmovaloper1dst',
      amount: { denom: 'uosmo', amount: '250000' },
    }).finish()

    const result = decodeCosmosMessageValue({
      typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      value: encoded,
    })

    expect(result).toEqual({
      delegatorAddress: 'osmo1abc',
      validatorSrcAddress: 'osmovaloper1src',
      validatorDstAddress: 'osmovaloper1dst',
      amount: { denom: 'uosmo', amount: '250000' },
    })
  })

  it('returns base64 for unknown typeUrls', () => {
    const value = new Uint8Array([0x01, 0x02, 0x03, 0x04])
    const result = decodeCosmosMessageValue({
      typeUrl: '/some.unknown.module.v1.MsgWhatever',
      value,
    })
    expect(result).toBe('AQIDBA==')
  })

  it('falls back to base64 if a known decoder throws on malformed bytes', () => {
    const result = decodeCosmosMessageValue({
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: new Uint8Array([0xff, 0xff, 0xff, 0xff]),
    })
    expect(typeof result).toBe('string')
  })

  it('converts bigint fields to strings so the result is JSON-safe', () => {
    // MsgVote.proposalId is a bigint in cosmjs-types. The decoder should
    // stringify it before returning so JSON.stringify doesn't throw.
    const result = decodeCosmosMessageValue({
      typeUrl: '/cosmos.gov.v1beta1.MsgVote',
      // proposalId=42, voter="cosmos1abc", option=1 (yes)
      // Hand-encoded: 08 2a 12 0a 63 6f 73 6d 6f 73 31 61 62 63 18 01
      value: new Uint8Array([
        0x08, 0x2a, 0x12, 0x0a, 0x63, 0x6f, 0x73, 0x6d, 0x6f, 0x73, 0x31, 0x61,
        0x62, 0x63, 0x18, 0x01,
      ]),
    })

    expect(result).toEqual({
      proposalId: '42',
      voter: 'cosmos1abc',
      option: 1,
    })
    // JSON.stringify shouldn't throw
    expect(() => JSON.stringify(result)).not.toThrow()
  })
})
