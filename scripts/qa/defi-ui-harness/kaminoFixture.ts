import { getKaminoPositionsQueryKey } from '@core/ui/defi/chain/solana/kamino/queries/useKaminoPositionsQuery'
import { kaminoVaultsQueryKey } from '@core/ui/defi/chain/solana/kamino/queries/useKaminoVaultsQuery'
import { QueryClient } from '@tanstack/react-query'
import {
  kaminoShareAmount,
  kaminoTokenAmount,
} from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { parseKaminoRate } from '@vultisig/core-chain/chains/solana/kamino/rate'
import {
  KaminoVaultDescriptor,
  kaminoVaultRegistry,
} from '@vultisig/core-chain/chains/solana/kamino/registry'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

type QaKaminoVault = {
  descriptor: KaminoVaultDescriptor
  /** Live on-chain name, which the registry's fallback stands in for offline. */
  name: string
  /** 30-day APY as a fraction, the same shape the metrics endpoint reports. */
  apy30d: number
  /** Underlying tokens per share, as a plain decimal string. */
  tokensPerShare: string
  /** Share balance the owner holds, in human units; `0` leaves the vault empty. */
  shares: number
  /** Lifetime PnL in the underlying token, or `undefined` for an unread one. */
  pnlToken?: number
}

type SeedKaminoInput = {
  queryClient: QueryClient
  owner: string
  vaults: QaKaminoVault[]
}

type ToBaseUnitsInput = {
  /** Human-units figure, as a scenario writes it. */
  value: number
  decimals: number
}

const toBaseUnits = ({ value, decimals }: ToBaseUnitsInput) =>
  BigInt(Math.round(value * 10 ** decimals))

const buildVaultInfo = ({
  descriptor,
  name,
  apy30d,
  tokensPerShare,
}: QaKaminoVault): KaminoVaultInfo => ({
  descriptor,
  name,
  minDeposit: kaminoTokenAmount(
    toBaseUnits({ value: 0.1, decimals: descriptor.tokenDecimals }),
    descriptor.tokenDecimals
  ),
  minWithdraw: kaminoShareAmount(
    toBaseUnits({ value: 0.1, decimals: descriptor.sharesDecimals }),
    descriptor.sharesDecimals
  ),
  lookupTable: 'QALookupTable111111111111111111111111111111',
  apy30d,
  tokensPerShare: shouldBePresent(
    parseKaminoRate(tokensPerShare),
    'tokensPerShare'
  ),
  tokenPriceUsd: 1,
  tokensAvailable: kaminoTokenAmount(
    toBaseUnits({ value: 50_000, decimals: descriptor.tokenDecimals }),
    descriptor.tokenDecimals
  ),
})

const buildOwnedPosition = ({ descriptor, shares, pnlToken }: QaKaminoVault) => {
  const amount = kaminoShareAmount(
    toBaseUnits({ value: shares, decimals: descriptor.sharesDecimals }),
    descriptor.sharesDecimals
  )

  return {
    vaultAddress: descriptor.address,
    shares: {
      staked: amount,
      unstaked: kaminoShareAmount(0n, descriptor.sharesDecimals),
      total: amount,
      spendable: amount,
      accountsForItsTotal: true,
      isPlausible: true,
    },
    pnlToken,
  }
}

/** The curated vault at `index`, so a scenario names vaults positionally. */
export const qaKaminoDescriptor = (index: number) =>
  shouldBePresent(kaminoVaultRegistry[index], `kamino vault ${index}`)

/**
 * Seeds hydrated Kamino vaults and the owner's positions in them, through the
 * production query keys, so the Earn cards render without any network call.
 *
 * Vaults with zero shares are left out of the positions record rather than
 * seeded as empty — that is what the API returns for a vault never deposited
 * into, and the empty-state card depends on the difference.
 */
export const seedKaminoEarn = ({
  queryClient,
  owner,
  vaults,
}: SeedKaminoInput) => {
  queryClient.setQueryData(kaminoVaultsQueryKey, vaults.map(buildVaultInfo))

  queryClient.setQueryData(
    getKaminoPositionsQueryKey(owner),
    Object.fromEntries(
      vaults
        .filter(({ shares }) => shares > 0)
        .map(vault => [vault.descriptor.address, buildOwnedPosition(vault)])
    )
  )
}
