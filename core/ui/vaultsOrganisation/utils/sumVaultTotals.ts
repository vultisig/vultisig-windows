import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

type SumVaultTotalsInput = {
  totals: Record<string, number> | undefined
  vaults: Vault[]
}

/** Sum of the given vaults' fiat totals, or undefined until every one of them is present. */
export const sumVaultTotals = ({ totals, vaults }: SumVaultTotalsInput) => {
  if (!totals) return undefined

  let total = 0
  for (const vault of vaults) {
    const value = totals[getVaultId(vault)]
    if (value === undefined) return undefined
    total += value
  }

  return total
}
