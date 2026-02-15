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
  isSelected?: boolean
  onToggle?: () => void
}

export const DefiChainItem = ({
  value: chain,
  canEnable,
  isSelected: controlledIsSelected,
  onToggle: controlledOnToggle,
}: DefiChainItemProps) => {
  const defiChains = useDefiChains()
  const { toggleChain, isPending } = useToggleDefiChainWithAutoEnable()
  const isSupported = isSupportedDefiChain(chain)

  const isControlled =
    controlledIsSelected !== undefined && controlledOnToggle !== undefined

  const isSelected = isControlled
    ? controlledIsSelected
    : isSupported && defiChains.includes(chain)
  const isDisabled = !canEnable && !isSelected
  const showPending = isControlled ? false : isPending

  const handleClick = () => {
    if (!isSupported || isDisabled) return
    if (isControlled) {
      controlledOnToggle()
    } else if (!isPending) {
      toggleChain(chain)
    }
  }

  return (
    <DefiItem
      icon={<ChainEntityIcon value={getChainLogoSrc(chain)} />}
      name={chain}
      isSelected={isSelected}
      isPending={showPending}
      isDisabled={isDisabled}
      onClick={handleClick}
    />
  )
}
