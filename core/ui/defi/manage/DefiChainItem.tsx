import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import {
  isSupportedDefiChain,
  useDefiChains,
  useToggleDefiChain,
} from '@core/ui/storage/defiChains'
import { ValueProp } from '@lib/ui/props'

import { DefiItem } from './DefiItem'

export const DefiChainItem = ({ value: chain }: ValueProp<Chain>) => {
  const defiChains = useDefiChains()
  const { toggleChain, isPending } = useToggleDefiChain()
  const isSupported = isSupportedDefiChain(chain)

  const isSelected = isSupported && defiChains.includes(chain)

  const handleClick = () => {
    if (isPending || !isSupported) return
    toggleChain(chain)
  }

  return (
    <DefiItem
      icon={<ChainEntityIcon value={getChainLogoSrc(chain)} />}
      name={chain}
      isSelected={isSelected}
      isPending={isPending}
      onClick={handleClick}
    />
  )
}
