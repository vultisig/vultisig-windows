import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { InputProps } from '@lib/ui/props'
import {
  SelectableItem,
  SelectableItemProps,
} from '@lib/ui/selection/SelectableItem'
import { Chain } from '@vultisig/core-chain/Chain'

type SelectableChainItemProps = InputProps<boolean> &
  Pick<SelectableItemProps, 'dimsInactive'> & {
    chain: Chain
  }

/** Selectable grid tile for one chain: its logo and display name. */
export const SelectableChainItem = ({
  chain,
  value,
  onChange,
  dimsInactive,
}: SelectableChainItemProps) => {
  return (
    <SelectableItem
      value={value}
      onChange={onChange}
      icon={<ChainEntityIcon value={getChainLogoSrc(chain)} />}
      name={getChainDisplayName(chain)}
      dimsInactive={dimsInactive}
    />
  )
}
