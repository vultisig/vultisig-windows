import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { makeAccountCoin } from '@core/chain/coin/utils/makeAccountCoin'
import { useMemo } from 'react'

import {
  useCurrentVaultAddresses,
  useCurrentVaultChainCoins,
} from '../../state/currentVaultCoins'
import { useDepositCoin } from '../providers/DepositCoinProvider'

export const useMintOptions = () => {
  const coins = useCurrentVaultChainCoins(Chain.THORChain)
  const [selectedCoin] = useDepositCoin()
  const address = useCurrentVaultAddresses()[selectedCoin.chain]
  const isTCYCoinInVault = coins.find(coin => coin.id === 'tcy')
  const factoredTCYCoin = useMemo(
    () => makeAccountCoin({ chain: Chain.THORChain, id: 'tcy' }, address),
    [address]
  )

  return useMemo(
    () => [
      { ...chainFeeCoin.THORChain, address },
      isTCYCoinInVault ?? factoredTCYCoin,
    ],
    [address, isTCYCoinInVault, factoredTCYCoin]
  )
}
