import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import {
  isSupportedDefiChain,
  useDefiChains,
  useToggleDefiChainWithAutoEnable,
} from '@core/ui/storage/defiChains'
import { ValueProp } from '@lib/ui/props'

import { DefiItem } from './DefiItem'

type DefiChainItemProps = ValueProp<Chain> & {
  canEnable: boolean
}

export const DefiChainItem = ({
  value: chain,
  canEnable,
}: DefiChainItemProps) => {
  const defiChains = useDefiChains()
  const { toggleChain, isPending } = useToggleDefiChainWithAutoEnable()
  const isSupported = isSupportedDefiChain(chain)

  const isSelected = isSupported && defiChains.includes(chain)
  const isDisabled = !canEnable && !isSelected

  const handleClick = () => {
    if (isPending || !isSupported || isDisabled) return
    toggleChain(chain)
  }

  return (
    <DefiItem
      icon={<ChainEntityIcon value={getChainLogoSrc(chain)} />}
      name={chain}
      isSelected={isSelected}
      isPending={isPending}
      isDisabled={isDisabled}
      onClick={handleClick}
    />
  )
}
