import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type AddressBookListItemProps = {
  isEditMode?: boolean
  onSelect?: (address: string) => void
} & AddressBookItem

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
    <StyledListItem
      description={<MiddleTruncate text={address} width={80} />}
      extra={
        <>
          <Text color="shy">{`${chain} ${t('network')}`}</Text>
          <IconButton onClick={() => mutate(id)} status="danger">
            <TrashIcon />
          </IconButton>
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
    <StyledListItem
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
          : navigate({ id: 'updateAddressBookItem', state: { id } })
      }
      title={title}
      hoverable
    />
  )
}

const StyledListItem = styled(ListItem)`
  background-color: transparent;
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.m};
  padding: 16px 20px;
  max-height: 68px;
`
