import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { resolveTransferableStakeToken } from './stakeUiResolver'

describe('resolveTransferableStakeToken', () => {
  it('sends the sRUJI receipt (not liquid RUJI) for the RUJI stake position', () => {
    const coin = resolveTransferableStakeToken(
      Chain.THORChain,
      'thor-stake-ruji'
    )

    expect(coin?.ticker).toBe('sRUJI')
    expect(coin?.id).toBe('x/staking-x/ruji')
    expect(coin?.chain).toBe(Chain.THORChain)
  })

  it('sends the sTCY receipt for the sTCY stake position', () => {
    const coin = resolveTransferableStakeToken(
      Chain.THORChain,
      'thor-stake-stcy'
    )

    expect(coin?.ticker).toBe('sTCY')
    expect(coin?.id).toBe('x/staking-tcy')
  })

  it('returns undefined for non-transferable positions', () => {
    expect(
      resolveTransferableStakeToken(Chain.THORChain, 'thor-bond-rune')
    ).toBeUndefined()
    expect(
      resolveTransferableStakeToken(Chain.THORChain, 'thor-stake-rune')
    ).toBeUndefined()
  })

  it('returns undefined for chains with no transferable stake tokens', () => {
    expect(
      resolveTransferableStakeToken(Chain.MayaChain, 'maya-stake-cacao')
    ).toBeUndefined()
  })
})
