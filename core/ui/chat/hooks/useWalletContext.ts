import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { useMemo } from 'react'

import { Balance, MessageContext } from '../state/chatTypes'

export const useWalletContext = (): MessageContext => {
  const vault = useCurrentVault()
  const addresses = useCurrentVaultAddresses()
  const balancesQuery = useVaultChainsBalancesQuery()

  return useMemo(() => {
    const balances: Balance[] = []

    // Flatten all coins from all chains
    if (balancesQuery.data) {
      for (const chainBalance of balancesQuery.data) {
        for (const coin of chainBalance.coins) {
          balances.push({
            chain: coin.chain,
            asset: coin.id ?? 'native',
            symbol: coin.ticker,
            amount: fromChainAmount(coin.amount, coin.decimals).toString(),
            decimals: coin.decimals,
          })
        }
      }
    }

    return {
      vault_address: vault ? getVaultId(vault) : undefined,
      balances,
      addresses,
    }
  }, [vault, balancesQuery.data, addresses])
}
