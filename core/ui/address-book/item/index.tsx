import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { Button } from '@lib/ui/buttons/Button'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface AddressBookListItemProps extends AddressBookItem {
  isEditMode?: boolean
  onSelect?: (address: string) => void
}

export const AddressBookListItem: FC<AddressBookListItemProps> = ({
  isEditMode,
  onSelect,
  ...values
}) => {
  const { t } = useTranslation()
  const { address, chain, id, title } = values
  const { mutate } = useDeleteAddressBookItemMutation()
  const navigate = useCoreNavigate()

  return isEditMode ? (
    <ListItem
      description={<MiddleTruncate text={address} width={80} />}
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
            value={getChainLogoSrc(chain)}
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
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 32 }}
        />
      }
      key={id}
      onClick={() =>
        onSelect
          ? onSelect(address)
          : navigate({ id: 'updateAddressBookItem', state: { values } })
      }
      title={title}
      hoverable
    />
  )
}
