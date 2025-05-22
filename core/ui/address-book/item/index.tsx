import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { Button } from '@lib/ui/buttons/Button'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/utils/truncate'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export interface AddressBookItem {
  address: string
  chain: Chain
  id: string
  order: number
  title: string
}

interface AddressBookListItemProps extends AddressBookItem {
  isEditMode?: boolean
  onSelect?: (address: string) => void
}

export const AddressBookListItem: FC<AddressBookListItemProps> = ({
  address,
  chain,
  id,
  isEditMode,
  onSelect,
  title,
}) => {
  const { t } = useTranslation()
  const { mutate } = useDeleteAddressBookItemMutation()
  const navigate = useCoreNavigate()

  return isEditMode ? (
    <ListItem
      description={address}
      extra={
        <>
          <Text color="shy">{`${chain} ${t('network')}`}</Text>
          <Button kind="alert" onClick={() => mutate(id)}>
            <TrashIcon fontSize={20} />
          </Button>
        </>
      }
      icon={
        <>
          <MenuIcon fontSize={20} />
          <ChainEntityIcon
            value={getChainEntityIconSrc(chain)}
            style={{ fontSize: 32 }}
          />
        </>
      }
      key={id}
      title={title}
      hoverable
    />
  ) : (
    <ListItem
      description={<MiddleTruncate text={address} width={80} />}
      extra={<Text color="shy">{`${chain} ${t('network')}`}</Text>}
      icon={
        <ChainEntityIcon
          value={getChainEntityIconSrc(chain)}
          style={{ fontSize: 32 }}
        />
      }
      key={id}
      onClick={() =>
        onSelect
          ? onSelect(address)
          : navigate({ id: 'manageAddress', state: { id } })
      }
      title={title}
      hoverable
    />
  )
}
