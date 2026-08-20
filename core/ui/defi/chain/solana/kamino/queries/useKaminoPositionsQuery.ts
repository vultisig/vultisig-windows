import { useQuery } from '@tanstack/react-query'
import {
  fetchKaminoPnl,
  fetchKaminoUserPositions,
} from '@vultisig/core-chain/chains/solana/kamino/api'
import { parseKaminoDisplayDecimal } from '@vultisig/core-chain/chains/solana/kamino/decimal'
import {
  KaminoSharePosition,
  parseKaminoSharePosition,
} from '@vultisig/core-chain/chains/solana/kamino/position'
import { getKaminoVaultDescriptor } from '@vultisig/core-chain/chains/solana/kamino/registry'

/** One curated vault's position, as held by the current vault's Solana address. */
type KaminoOwnedPosition = {
  vaultAddress: string
  shares: KaminoSharePosition
  /**
   * Lifetime profit and loss in the vault's underlying token, `undefined`
   * when the PnL read failed — one display line is dropped rather than the
   * whole position, which the balance depends on.
   */
  pnlToken?: number
}

/** The query key for one owner's Kamino positions, shared with the refresh. */
export const getKaminoPositionsQueryKey = (owner: string) =>
  ['kaminoPositions', owner] as const

/**
 * The owner's positions across the curated vaults, keyed by vault address.
 *
 * Uncached (`staleTime: 0`): a position has to reflect a just-confirmed
 * deposit or withdraw. Positions in vaults the registry does not carry are
 * dropped — an address we never curated cannot be valued or acted on here.
 */
export const useKaminoPositionsQuery = (owner: string) =>
  useQuery({
    queryKey: getKaminoPositionsQueryKey(owner),
    enabled: owner.length > 0,
    staleTime: 0,
    gcTime: 0,
    queryFn: async (): Promise<Record<string, KaminoOwnedPosition>> => {
      const reported = await fetchKaminoUserPositions(owner)

      const owned = reported.flatMap(position => {
        const descriptor = getKaminoVaultDescriptor(position.vaultAddress)
        if (!descriptor) return []

        const shares = parseKaminoSharePosition({
          position,
          shareDecimals: descriptor.sharesDecimals,
        })
        // A value that is present and unreadable is a failed read, not a zero
        // balance, so the position is dropped rather than shown as empty.
        if (!shares) return []

        return [{ vaultAddress: descriptor.address, shares }]
      })

      const withPnl = await Promise.all(
        owned.map(async position => {
          const pnl = await fetchKaminoPnl({
            owner,
            vault: position.vaultAddress,
          }).catch(() => undefined)

          return {
            ...position,
            pnlToken: pnl
              ? parseKaminoDisplayDecimal(pnl.totalPnl.token)
              : undefined,
          }
        })
      )

      return Object.fromEntries(
        withPnl.map(position => [position.vaultAddress, position])
      )
    },
  })
