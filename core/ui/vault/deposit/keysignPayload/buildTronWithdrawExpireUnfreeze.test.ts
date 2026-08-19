import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getTronSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/tron'
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

describe('buildDepositKeysignPayload TRON expired-unfreeze claim', () => {
  beforeEach(() => {
    getChainSpecific.mockResolvedValue({
      case: 'tronSpecific',
      value: {
        timestamp: 1n,
        expiration: 2n,
        blockHeaderTimestamp: 3n,
        blockHeaderNumber: 4n,
        blockHeaderVersion: 0n,
        blockHeaderTxTrieRoot: '00'.repeat(32),
        blockHeaderParentHash: '11'.repeat(32),
        blockHeaderWitnessAddress: '22'.repeat(21),
        gasEstimation: 999n,
      },
    })
  })

  it('carries the display amount while signing the amountless owner-only native claim contract', async () => {
    const ownerAddress = 'TClaimOwner'
    const payload = await buildDepositKeysignPayload({
      coin: {
        chain: Chain.Tron,
        ticker: 'TRX',
        decimals: 6,
        address: ownerAddress,
      } as AccountCoin,
      action: tronWithdrawExpireUnfreezeAction,
      depositData: { amount: '12.5' },
      amount: '12.5',
      memo: tronWithdrawExpireUnfreezeMemo,
      vaultId: 'vault-id',
      localPartyId: 'party-id',
      publicKey: null,
      hexPublicKeyOverride: '02'.repeat(33),
      libType: 'DKLS',
      walletCore: {} as WalletCore,
    })

    expect(payload.toAddress).toBe(ownerAddress)
    expect(payload.toAmount).toBe('12500000')
    expect(payload.memo).toBe(tronWithdrawExpireUnfreezeMemo)
    expect(payload.contractPayload.case).toBeUndefined()

    const [input] = await getTronSigningInputs({
      keysignPayload: payload,
      walletCore: {} as WalletCore,
    })

    expect(input.transaction?.withdrawExpireUnfreeze?.ownerAddress).toBe(
      ownerAddress
    )
    expect(input.transaction?.transfer).toBeNull()
  })
})
