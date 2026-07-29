import { useQuery } from '@tanstack/react-query'
import { rippleOwnerReserveDrops } from '@vultisig/core-chain/chains/ripple/issuedCurrency'
import { getRippleNetworkInfo } from '@vultisig/core-chain/chains/ripple/network/info'
import { maxBigInt } from '@vultisig/lib-utils/math/maxBigInt'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

/** Mirrors the keysign fee resolver so the quote matches what actually gets signed. */
const minProtocolFee = 15n
const baseFeeMultiplier = 2n

type RippleTrustLineCost = {
  /** XRP this line locks up for as long as it exists — immobilised, not spent. */
  ownerReserveDrops: bigint
  /** Fee burned by the TrustSet itself. */
  feeDrops: bigint
}

/**
 * What opening one XRPL trust line costs right now.
 *
 * Every ledger object an account owns — a trust line included — raises its
 * reserve floor by one owner-reserve increment. That increment is a
 * validator-voted network parameter (0.2 XRP on mainnet today, but a value, not
 * a constant), so it is read live from `server_state` and only falls back to the
 * bundled figure when the ledger cannot be reached.
 */
export const useRippleTrustLineCostQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ['rippleTrustLineCost'],
    queryFn: async (): Promise<RippleTrustLineCost> => {
      const { validated_ledger, load_factor, load_base } =
        await getRippleNetworkInfo()

      if (!validated_ledger) {
        throw new Error('No validated ledger available')
      }

      const { base_fee, reserve_inc } = validated_ledger

      const computedFee =
        ((BigInt(base_fee) * BigInt(load_factor)) / BigInt(load_base)) *
        baseFeeMultiplier

      return {
        ownerReserveDrops: BigInt(reserve_inc),
        feeDrops: maxBigInt(computedFee, minProtocolFee),
      }
    },
    enabled,
    staleTime: convertDuration(1, 'min', 'ms'),
    // A brief `server_state` outage must not block a legitimate activation: the
    // bundled increment is the current mainnet value, and the affordability
    // check it feeds is a guard rather than the ledger's own enforcement.
    placeholderData: {
      ownerReserveDrops: rippleOwnerReserveDrops,
      feeDrops: minProtocolFee,
    },
  })
