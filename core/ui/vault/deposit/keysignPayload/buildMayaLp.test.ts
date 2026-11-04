import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildDepositKeysignPayload } from './build'

const { getChainSpecific, getOpenMayaLpInbound } = vi.hoisted(() => ({
  getChainSpecific: vi.fn(),
  getOpenMayaLpInbound: vi.fn(),
}))

vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific,
}))

vi.mock('@vultisig/core-mpc/keysign/utxo/getKeysignUtxoInfo', () => ({
  getKeysignUtxoInfo: vi.fn(async () => []),
}))

vi.mock('../mayaLp/inbound', () => ({ getOpenMayaLpInbound }))

const mayaInbound = 'bc1qmayainbound'

const build = (coin: AccountCoin, pool: string) =>
  buildDepositKeysignPayload({
    coin,
    action: 'add_maya_lp',
    depositData: { amount: '0.01', pool },
    amount: '0.01',
    memo: `+:${pool}:paired`,
    vaultId: 'vault-id',
    localPartyId: 'party-id',
    publicKey: null,
    hexPublicKeyOverride: '02'.repeat(33),
    libType: 'DKLS',
    walletCore: {} as WalletCore,
  })

const btcCoin = {
  chain: Chain.Bitcoin,
  ticker: 'BTC',
  decimals: 8,
  address: 'bc1qvault',
} as AccountCoin

const cacaoCoin = {
  chain: Chain.MayaChain,
  ticker: 'CACAO',
  decimals: 10,
  address: 'maya1vault',
} as AccountCoin

describe('buildDepositKeysignPayload add_maya_lp', () => {
  beforeEach(() => {
    getChainSpecific.mockReset()
    getChainSpecific.mockResolvedValue({
      case: 'mayaSpecific',
      value: {},
    })
    getOpenMayaLpInbound.mockReset()
    getOpenMayaLpInbound.mockResolvedValue({ address: mayaInbound })
  })

  it('sends the asset side to its chain’s Maya inbound as a transfer', async () => {
    const payload = await build(btcCoin, 'BTC.BTC')

    expect(getOpenMayaLpInbound).toHaveBeenCalledWith({
      chainCode: 'BTC',
      amount: { units: 1_000_000n, decimals: 8 },
    })
    expect(payload.toAddress).toBe(mayaInbound)
    expect(payload.toAmount).toBe('1000000')
    expect(getChainSpecific.mock.calls[0][0].isDeposit).toBe(false)
  })

  it('refuses an asset side whose pool is not its chain’s', async () => {
    await expect(build(btcCoin, 'ETH.ETH')).rejects.toThrow(
      /not the MayaChain pool/
    )
    expect(getChainSpecific).not.toHaveBeenCalled()
  })

  it('keeps the CACAO side a MsgDeposit after checking the pool’s chain', async () => {
    const payload = await build(cacaoCoin, 'ETH.ETH')

    expect(getOpenMayaLpInbound).toHaveBeenCalledWith({ chainCode: 'ETH' })
    expect(payload.toAddress).toBe('')
    expect(payload.toAmount).toBe('100000000')
    expect(getChainSpecific.mock.calls[0][0].isDeposit).toBe(true)
  })

  it('stops before signing when MayaChain refuses the add', async () => {
    getOpenMayaLpInbound.mockRejectedValue(
      new Error('BTC chain is currently halted on MayaChain')
    )

    await expect(build(btcCoin, 'BTC.BTC')).rejects.toThrow(/halted/)
    expect(getChainSpecific).not.toHaveBeenCalled()
  })
})
