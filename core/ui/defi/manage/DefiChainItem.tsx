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

  const hasControlledIsSelected = controlledIsSelected !== undefined
  const hasControlledOnToggle = controlledOnToggle !== undefined
  const isControlled = hasControlledIsSelected && hasControlledOnToggle

  const hasPartialControlledProps =
    hasControlledIsSelected !== hasControlledOnToggle
  if (hasPartialControlledProps) {
    console.error(
      'DefiChainItem: controlled usage requires both controlledIsSelected and controlledOnToggle. ' +
        'Provide both for controlled mode or omit both for uncontrolled mode.'
    )
    return null
  }

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
