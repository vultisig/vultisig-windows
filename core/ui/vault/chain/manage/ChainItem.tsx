import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { ValueProp } from '@lib/ui/props'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins, Coin } from '@vultisig/core-chain/coin/Coin'
import { useMemo } from 'react'

import { ChainTile } from './shared/ChainTile'

type ChainItemProps = ValueProp<Coin> & {
  isSelected?: boolean
  onToggle?: () => void
}

export const ChainItem = ({
  value: coin,
  isSelected: controlledIsSelected,
  onToggle: controlledOnToggle,
}: ChainItemProps) => {
  const currentCoins = useCurrentVaultNativeCoins()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()

  const currentCoin = useMemo(() => {
    return currentCoins.find(c => areEqualCoins(c, coin))
  }, [currentCoins, coin])

  const isControlled =
    controlledIsSelected !== undefined && controlledOnToggle !== undefined

  const isSelected = isControlled ? controlledIsSelected : !!currentCoin
  const isLoading = isControlled
    ? false
    : createCoin.isPending || deleteCoin.isPending

  const handleClick = () => {
    if (isLoading) return
    if (isControlled) {
      controlledOnToggle()
    } else if (currentCoin) {
      deleteCoin.mutate(extractAccountCoinKey(currentCoin))
    } else {
      createCoin.mutate(coin)
    }
  }

  return (
    <ChainTile
      data-testid={`chain-item-${coin.chain}`}
      iconSrc={getChainLogoSrc(coin.chain)}
      name={getChainDisplayName(coin.chain)}
      isSelected={isSelected}
      onClick={handleClick}
    />
  )
}
