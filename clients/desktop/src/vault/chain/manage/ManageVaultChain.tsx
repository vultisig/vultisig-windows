import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { ValueProp } from '@lib/ui/props'

import { ManageVaultCoin } from './ManageVaultCoin'

export const ManageVaultChain = ({ value }: ValueProp<Chain>) => {
  const coin = chainFeeCoin[value]

  return (
    <ManageVaultCoin
      value={coin}
      icon={
        <ChainEntityIcon
          value={getChainEntityIconSrc(value)}
          style={{ fontSize: 32 }}
        />
      }
    />
  )
}
