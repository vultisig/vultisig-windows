import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { makeAccountCoin } from '@vultisig/core-chain/coin/utils/makeAccountCoin'
import { useMemo } from 'react'

import {
  useCurrentVaultAddresses,
  useCurrentVaultChainCoins,
} from '../../state/currentVaultCoins'

export const useMintOptions = () => {
  const coins = useCurrentVaultChainCoins(Chain.THORChain)
  const address = useCurrentVaultAddresses()[Chain.THORChain]

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
