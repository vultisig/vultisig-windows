import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { MiddleTruncate } from '@lib/ui/truncate'

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
    <ListItem
      description={<MiddleTruncate text={address} width={80} />}
      icon={<AddressBookItemAvatar name={name} address={address} />}
      key={address}
      onClick={() => onSelect(address)}
      title={name}
      hoverable
    />
  )
}
