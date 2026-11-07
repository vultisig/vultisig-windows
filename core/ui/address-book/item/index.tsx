import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ListItem } from '@lib/ui/list/item'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import styled from 'styled-components'

type AddressBookListItemProps = {
  onSelect: (address: string) => void
} & AddressBookItem

export const AddressBookListItem: FC<AddressBookListItemProps> = ({
  onSelect,
  ...values
}) => {
  const { address, chain, id, title } = values

  return (
    <StyledListItem
      description={<MiddleTruncate text={address} width={200} />}
      icon={
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 32 }}
        />
      }
      key={id}
      onClick={() => onSelect(address)}
      title={title}
      hoverable
    />
  )
}

const StyledListItem = styled(ListItem)`
  background-color: transparent;
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.md};
  padding: 16px 20px;
  max-height: 68px;
`
