import { areEqualCoins, coinKeyToString } from '@core/chain/coin/Coin'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { ManageVaultCoin } from '../../../vault/chain/manage/coin/ManageVaultCoin'
import { useCurrentVaultChainCoins } from '../../../vault/state/currentVaultCoins'
import { CustomTokenResult } from './CustomTokenResult'

export const CustomToken = ({ id }: { id: string }) => {
  const [{ chain }] = useCoreViewState<'addCustomToken'>()

  const coins = useCurrentVaultChainCoins(chain)

  const coin = coins.find(coin => areEqualCoins(coin, { id, chain }))

  if (coin) {
    return <ManageVaultCoin key={coinKeyToString(coin)} value={coin} />
  }

  return <CustomTokenResult id={id} />
}
