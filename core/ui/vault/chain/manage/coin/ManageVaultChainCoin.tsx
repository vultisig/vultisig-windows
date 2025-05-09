import { Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { ValueProp } from '@lib/ui/props'

import { ManageVaultCoin } from '../ManageVaultCoin'

export const ManageVaultChainCoin = ({ value }: ValueProp<Coin>) => {
  return (
    <ManageVaultCoin
      value={value}
      icon={
        <ChainEntityIcon
          value={getCoinLogoSrc(value.logo)}
          style={{ fontSize: 32 }}
        />
      }
    />
  )
}
