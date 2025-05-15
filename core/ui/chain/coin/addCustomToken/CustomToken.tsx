import { areEqualCoins, coinKeyToString } from '@core/chain/coin/Coin'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { ManageVaultChainCoin } from '../../../vault/chain/manage/coin/ManageVaultChainCoin'
import { useCurrentVaultChainCoins } from '../../../vault/state/currentVaultCoins'
import { CustomTokenResult } from './CustomTokenResult'

export const CustomToken = ({ address }: { address: string }) => {
  const [{ chain }] = useCoreViewState<'addCustomToken'>()

  const coins = useCurrentVaultChainCoins(chain)

  const coin = coins.find(coin => areEqualCoins(coin, { id: address, chain }))

  if (coin) {
    return <ManageVaultChainCoin key={coinKeyToString(coin)} value={coin} />
  }

  return <CustomTokenResult address={address} />
}
