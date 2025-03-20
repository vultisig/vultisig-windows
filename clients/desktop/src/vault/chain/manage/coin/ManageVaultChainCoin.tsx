import { Coin } from '@core/chain/coin/Coin'
import { ValueProp } from '@lib/ui/props'

import { ChainEntityIcon } from '../../../../chain/ui/ChainEntityIcon'
import { getCoinLogoSrc } from '../../../../coin/logo/getCoinLogoSrc'
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
