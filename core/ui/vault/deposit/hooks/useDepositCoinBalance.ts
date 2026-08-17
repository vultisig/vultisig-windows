import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { useMemo } from 'react'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useVaultChainCoinsQuery } from '../../queries/useVaultChainCoinsQuery'
import { useCurrentVaultAddress } from '../../state/currentVaultCoins'
import { useDepositCoin } from '../providers/DepositCoinProvider'

type Params = {
  chain: Chain
}

export const useDepositCoinBalance = ({ chain }: Params) => {
  const [selectedCoin] = useDepositCoin()
  const { data: vaultCoins = [] } = useVaultChainCoinsQuery(chain)
  const vaultEntry = vaultCoins.find(c => c.id === selectedCoin.id)
  const thorAddr = useCurrentVaultAddress(Chain.THORChain)

  const { data: yTokenRawBalance = 0n } = useBalanceQuery({
    chain: Chain.THORChain,
    address: thorAddr,
    id: selectedCoin.id,
  })

  return useMemo(() => {
    if (!selectedCoin) return { balance: 0, balanceUnits: 0n }

    if (!vaultEntry) {
      return {
        balance: fromChainAmount(yTokenRawBalance, selectedCoin.decimals),
        balanceUnits: yTokenRawBalance,
      }
    }

    return {
      balance: fromChainAmount(vaultEntry.amount, vaultEntry.decimals),
      // Units are only meaningful when they share the form coin's scale
      balanceUnits:
        vaultEntry.decimals === selectedCoin.decimals
          ? BigInt(vaultEntry.amount)
          : null,
    }
  }, [selectedCoin, vaultEntry, yTokenRawBalance])
}
