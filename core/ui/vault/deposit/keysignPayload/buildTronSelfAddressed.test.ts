import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  tronWithdrawExpireUnfreezeAction,
  tronWithdrawExpireUnfreezeMemo,
} from '../tron/withdrawExpireUnfreeze'
import { buildDepositKeysignPayload } from './build'

const { getChainSpecific } = vi.hoisted(() => ({
  getChainSpecific: vi.fn(),
}))

vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific,
}))

vi.mock('@vultisig/core-mpc/keysign/utxo/getKeysignUtxoInfo', () => ({
  getKeysignUtxoInfo: vi.fn(async () => []),
}))

const ownerAddress = 'TStakeOwner'

describe('buildDepositKeysignPayload TRON Stake 2.0 fee lookup', () => {
  beforeEach(() => {
    getChainSpecific.mockReset()
    getChainSpecific.mockResolvedValue({
      case: 'tronSpecific',
      value: { gasEstimation: 0n },
    })
  })

  it.each([
    { action: 'freeze', memo: 'FREEZE:BANDWIDTH' },
    { action: 'unfreeze', memo: 'UNFREEZE:BANDWIDTH' },
    {
      action: tronWithdrawExpireUnfreezeAction,
      memo: tronWithdrawExpireUnfreezeMemo,
    },
  ] as const)(
    'addresses $action to the vault before the fee lookup',
    async ({ action, memo }) => {
      const payload = await buildDepositKeysignPayload({
        coin: {
          chain: Chain.Tron,
          ticker: 'TRX',
          decimals: 6,
          address: ownerAddress,
        } as AccountCoin,
        action,
        depositData: { amount: '1' },
        amount: '1',
        memo,
        vaultId: 'vault-id',
        localPartyId: 'party-id',
        publicKey: null,
        hexPublicKeyOverride: '02'.repeat(33),
        libType: 'DKLS',
        walletCore: {} as WalletCore,
      })

      expect(getChainSpecific).toHaveBeenCalledOnce()
      expect(getChainSpecific.mock.calls[0][0].keysignPayload.toAddress).toBe(
        ownerAddress
      )
      expect(payload.toAddress).toBe(ownerAddress)
      expect(payload.toAmount).toBe('1000000')
    }
  )
})
