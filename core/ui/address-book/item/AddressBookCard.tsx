import { AddressBookItem } from '@core/ui/address-book/model'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { useDeleteAddressBookItemMutation } from '@core/ui/storage/addressBook'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { GripDotsVerticalIcon } from '@lib/ui/icons/GripDotsVerticalIcon'
import { TrashFilledIcon } from '@lib/ui/icons/TrashFilledIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import styled from 'styled-components'

type AddressBookCardProps = {
  isEditMode?: boolean
} & AddressBookItem

const chainLogoSlotSize = 32
const chainLogoSize = 24
const trashIconSize = 20
const trashButtonSize = 32

/** One saved address on the Address Book page: opens the editor, or deletes in edit mode. */
export const AddressBookCard = ({
  isEditMode,
  address,
  chain,
  id,
  title,
}: AddressBookCardProps) => {
  const { mutate } = useDeleteAddressBookItemMutation()
  const navigate = useCoreNavigate()

  const content = (
    <>
      <ChainLogoSlot>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: chainLogoSize }}
        />
      </ChainLogoSlot>
      <Details>
        <SettingsBaselineText
          as="div"
          color="regular"
          cropped
          variant="stationBodyS"
        >
          {title}
        </SettingsBaselineText>
        <Text as="div" color="shyExtra" variant="caption">
          <MiddleTruncate text={address} width="100%" />
        </Text>
      </Details>
    </>
  )

  if (!isEditMode) {
    return (
      <Card
        onClick={() => navigate({ id: 'updateAddressBookItem', state: { id } })}
      >
        {content}
      </Card>
    )
  }

  return (
    <HStack alignItems="center" gap={5}>
      <Grip />
      <EditCard>
        {content}
        <TrashButton onClick={() => mutate(id)}>
          <TrashFilledIcon />
        </TrashButton>
      </EditCard>
    </HStack>
  )
}

const Card = styled.div`
  ${borderRadius.xl};
  align-items: center;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: 12px;
  height: 66px;
  padding: 15px;
  transition: all 0.2s;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

// eslint-disable-next-line local/no-hardcoded-border-radius -- the frame's 54 pill, between the scale's 24 and full
const EditCard = styled(Card)`
  border-radius: 54px;
  cursor: grab;
  flex: 1;
  min-width: 0;
  padding: 15px 19px 15px 15px;
`

const ChainLogoSlot = styled.div`
  ${centerContent};
  ${sameDimensions(chainLogoSlotSize)};
  flex-shrink: 0;
`

const Details = styled(VStack)`
  flex: 1;
  gap: 4px;
  min-width: 0;
`

const Grip = styled(GripDotsVerticalIcon)`
  color: ${getColor('text')};
  flex-shrink: 0;
  height: 24px;
  width: 22px;
`

// The 32 tap target stays, with the glyph on the frame's 20 slot.
const TrashButton = styled(IconButton)`
  color: ${getColor('textShy')};
  flex-shrink: 0;
  font-size: ${trashIconSize}px;
  margin: 0 ${(trashIconSize - trashButtonSize) / 2}px;
`
