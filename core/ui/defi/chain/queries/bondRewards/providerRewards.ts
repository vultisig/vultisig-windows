import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'
import { maxBigInt } from '@vultisig/lib-utils/math/maxBigInt'
import { minBigInt } from '@vultisig/lib-utils/math/minBigInt'
import { recordMap } from '@vultisig/lib-utils/record/recordMap'

import { parseBigint } from '../utils/parsers'

/**
 * Each bond provider's payout from a node award, in the chain's base units,
 * keyed by lowercased bond address.
 */
export type BondProviderRewards = Record<string, bigint>

type BondProviderEntry = {
  bond_address?: string
  bond?: string
  reward?: string
}

const basisPointsInWhole = 10_000n

const sumByProvider = (
  providers: BondProviderEntry[],
  getAmount: (provider: BondProviderEntry) => bigint
) =>
  providers.reduce<BondProviderRewards>((result, provider) => {
    if (!provider.bond_address) return result

    const address = provider.bond_address.toLowerCase()

    return {
      ...result,
      [address]: (result[address] ?? 0n) + getAmount(provider),
    }
  }, {})

type GetThorchainBondProviderRewardsInput = {
  award: bigint
  operatorFeeBps: bigint
  providers: BondProviderEntry[]
}

/**
 * THORNode reports only the node's award, so each provider gets the award
 * minus the operator fee, split by their share of the node's bond. Every
 * listed provider gets an entry, even with nothing to earn.
 */
export const getThorchainBondProviderRewards = ({
  award,
  operatorFeeBps,
  providers,
}: GetThorchainBondProviderRewardsInput): BondProviderRewards => {
  const bonds = sumByProvider(providers, ({ bond }) => parseBigint(bond))
  const totalBond = bigIntSum(Object.values(bonds))
  const operatorFee = minBigInt(
    maxBigInt(operatorFeeBps, 0n),
    basisPointsInWhole
  )
  const providersPart = basisPointsInWhole - operatorFee

  return recordMap(bonds, bond =>
    totalBond > 0n
      ? (award * providersPart * bond) / (basisPointsInWhole * totalBond)
      : 0n
  )
}

/**
 * MAYANode already splits the award per provider, paying the operator fee
 * into the operator's own row, so each provider's `reward` is their payout.
 */
export const getMayachainBondProviderRewards = (
  providers: BondProviderEntry[]
): BondProviderRewards =>
  sumByProvider(providers, ({ reward }) => parseBigint(reward))

type GetBondProviderRewardInput = {
  rewards: BondProviderRewards
  bondAddress: string
}

/**
 * The payout owed to one bond address, or null when the address was not a
 * bond provider on the node at that point.
 */
export const getBondProviderReward = ({
  rewards,
  bondAddress,
}: GetBondProviderRewardInput): bigint | null =>
  rewards[bondAddress.toLowerCase()] ?? null
