import { AuthInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { injectKeplrFeeIfMissing } from '@clients/extension/src/inpage/providers/cosmos/injectKeplrFeeIfMissing'

const encodeAuthInfo = (input: Parameters<typeof AuthInfo.fromPartial>[0]) =>
  AuthInfo.encode(AuthInfo.fromPartial(input)).finish()

describe('injectKeplrFeeIfMissing', () => {
  it('injects a fee computed from gasLimit × gasPrice when fee.amount is empty', () => {
    // Osmosis gas price is 0.04 uosmo/gas (chain-registry "high" tier, set
    // above the historical 0.025 average to clear the post-EIP-1559 floor).
    // With gasLimit 310823 that's ceil(310823 * 0.04) = ceil(12432.92) = 12433.
    const input = encodeAuthInfo({
      signerInfos: [],
      fee: { amount: [], gasLimit: 310823n, payer: '', granter: '' },
    })

    const out = injectKeplrFeeIfMissing({ authInfoBytes: input, chain: 'Osmosis' })

    const decoded = AuthInfo.decode(out)
    expect(decoded.fee?.amount).toEqual([{ denom: 'uosmo', amount: '12433' }])
    expect(decoded.fee?.gasLimit).toBe(310823n)
  })

  it('clears the Osmosis post-EIP-1559 fee floor (≥0.03 uosmo/gas)', () => {
    // Regression for the case where Osmosis returned `required: 9325uosmo`
    // for a 310823-gas tx — our injected fee must stay above that.
    const input = encodeAuthInfo({
      signerInfos: [],
      fee: { amount: [], gasLimit: 310823n, payer: '', granter: '' },
    })

    const out = injectKeplrFeeIfMissing({ authInfoBytes: input, chain: 'Osmosis' })
    const decoded = AuthInfo.decode(out)
    const amount = BigInt(decoded.fee?.amount[0]?.amount ?? '0')
    expect(amount).toBeGreaterThan(9325n)
  })

  it('leaves bytes unchanged when fee.amount is already populated', () => {
    const input = encodeAuthInfo({
      signerInfos: [],
      fee: {
        amount: [{ denom: 'uosmo', amount: '5000' }],
        gasLimit: 200000n,
        payer: '',
        granter: '',
      },
    })

    const out = injectKeplrFeeIfMissing({ authInfoBytes: input, chain: 'Osmosis' })

    expect(Array.from(out)).toEqual(Array.from(input))
  })

  it('leaves bytes unchanged when gasLimit is 0 (can’t compute a fee)', () => {
    const input = encodeAuthInfo({
      signerInfos: [],
      fee: { amount: [], gasLimit: 0n, payer: '', granter: '' },
    })

    const out = injectKeplrFeeIfMissing({ authInfoBytes: input, chain: 'Osmosis' })

    expect(Array.from(out)).toEqual(Array.from(input))
  })

  it('leaves bytes unchanged when AuthInfo can’t be decoded', () => {
    const garbage = new Uint8Array([0xff, 0xff, 0xff])
    const out = injectKeplrFeeIfMissing({
      authInfoBytes: garbage,
      chain: 'Osmosis',
    })
    expect(Array.from(out)).toEqual(Array.from(garbage))
  })

  it('uses the correct denom for each chain', () => {
    const buildInput = () =>
      encodeAuthInfo({
        signerInfos: [],
        fee: { amount: [], gasLimit: 100000n, payer: '', granter: '' },
      })

    const atom = AuthInfo.decode(
      injectKeplrFeeIfMissing({ authInfoBytes: buildInput(), chain: 'Cosmos' })
    )
    expect(atom.fee?.amount[0]?.denom).toBe('uatom')

    const terra = AuthInfo.decode(
      injectKeplrFeeIfMissing({ authInfoBytes: buildInput(), chain: 'Terra' })
    )
    expect(terra.fee?.amount[0]?.denom).toBe('uluna')
  })
})
