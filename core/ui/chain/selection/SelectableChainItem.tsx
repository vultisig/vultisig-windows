import { Chain } from '@core/chain/Chain'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { InputProps } from '@lib/ui/props'
import { SelectableItem } from '@lib/ui/selection/SelectableItem'
import styled from 'styled-components'

const ChainIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

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
      icon={<ChainIcon src={getChainLogoSrc(chain)} alt={chain} />}
      name={chain}
    />
  )
}
