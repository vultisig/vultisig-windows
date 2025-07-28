import { borderRadius } from '@lib/ui/css/borderRadius'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import styled from 'styled-components'

import { AddressBookItemAvatar } from './AddressBookItemAvatar'

export type VaultAddressBookItem = {
  name: string
  address: string
}

export const VaultAddressBookItem = ({
  value: { address, name },
  onSelect,
}: ValueProp<VaultAddressBookItem> & {
  onSelect: (address: string) => void
}) => {
  return (
    <AddressBookListItem
      description={<MiddleTruncate text={address} width={80} />}
      icon={<AddressBookItemAvatar name={name} address={address} />}
      key={address}
      onClick={() => onSelect(address)}
      title={<Text size={14}>{name}</Text>}
      hoverable
    />
  )
}

const AddressBookListItem = styled(ListItem)`
  background-color: transparent;
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.m};
  padding: 16px 20px;
  max-height: 68px;
`
