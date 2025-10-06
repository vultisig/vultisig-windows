import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { GripVerticalIcon } from '@lib/ui/icons/GripVerticalIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TrashIcon2 } from '@lib/ui/icons/TrashIcon2'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import styled, { useTheme } from 'styled-components'

type AddressBookListItemProps = {
  isEditMode?: boolean
  onSelect?: (address: string) => void
} & AddressBookItem

export const AddressBookListItem: FC<AddressBookListItemProps> = ({
  isEditMode,
  onSelect,
  ...values
}) => {
  const { address, chain, id, title } = values
  const { mutate } = useDeleteAddressBookItemMutation()
  const navigate = useCoreNavigate()
  const { colors } = useTheme()

  return isEditMode ? (
    <HStack alignItems="center" gap={5}>
      <IconWrapper size={23} color="textShy">
        <GripVerticalIcon />
      </IconWrapper>
      <StyledListItem
        style={{
          flex: 1,
          background: colors.foreground.toCssValue(),
        }}
        description={<MiddleTruncate text={address} width={200} />}
        extra={
          <>
            <IconButton
              style={{
                color: colors.textShy.toCssValue(),
              }}
              onClick={() => mutate(id)}
            >
              <TrashIcon2 />
            </IconButton>
          </>
        }
        icon={
          <ChainEntityIcon
            value={getChainLogoSrc(chain)}
            style={{ fontSize: 32 }}
          />
        }
        key={id}
        title={title}
        hoverable
      />
    </HStack>
  ) : (
    <StyledListItem
      description={<MiddleTruncate text={address} width={200} />}
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
