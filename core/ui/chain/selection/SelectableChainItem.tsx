import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { InputProps } from '@lib/ui/props'
import { SelectableItem } from '@lib/ui/selection/SelectableItem'
import { Chain } from '@vultisig/core-chain/Chain'

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
