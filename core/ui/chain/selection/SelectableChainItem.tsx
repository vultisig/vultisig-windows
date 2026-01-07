import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { InputProps } from '@lib/ui/props'
import { SelectableItem } from '@lib/ui/selection/SelectableItem'

type SelectableChainItemProps = InputProps<boolean> & {
  chain: Chain
}

export const SelectableChainItem = ({
  chain,
  value,
  onChange,
}: SelectableChainItemProps) => {
  return (
    <SelectableItem
      value={value}
      onChange={onChange}
      icon={<ChainEntityIcon value={getChainLogoSrc(chain)} />}
      name={chain}
    />
  )
}
