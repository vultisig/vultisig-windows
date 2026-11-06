import { AddressBookCard } from '@core/ui/address-book/item/AddressBookCard'
import { AddressBookItem } from '@core/ui/address-book/model'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import {
  SettingsCtaButton,
  SettingsHugCtaButton,
} from '@core/ui/settings/SettingsCtaButton'
import { SettingsGlow } from '@core/ui/settings/SettingsGlow'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import {
  useAddressBookItems,
  useUpdateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { PenIcon } from '@lib/ui/icons/PenIcon'
import { VStack } from '@lib/ui/layout/Stack'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { PageContent } from '@lib/ui/page/PageContent'
import { sortEntitiesWithOrder } from '@vultisig/lib-utils/entities/EntityWithOrder'
import { getNewOrder } from '@vultisig/lib-utils/order/getNewOrder'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const cardGap = 8

export const AddressBookPage = () => {
  const { t } = useTranslation()
  const { mutate } = useUpdateAddressBookItemMutation()
  const [items, setItems] = useState<AddressBookItem[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const addressBookItems = useAddressBookItems()
  const navigate = useCoreNavigate()

  useEffect(() => setItems(addressBookItems), [addressBookItems])

  return addressBookItems.length ? (
    <VStack fullHeight>
      <SettingsPageHeader
        onBack={isEditMode ? () => setIsEditMode(false) : undefined}
        secondaryControls={
          !isEditMode && (
            <EditButton onClick={() => setIsEditMode(true)}>
              <PenIcon />
            </EditButton>
          )
        }
        title={t(isEditMode ? 'edit_address_book' : 'address_book')}
      />
      <SettingsPageContent flexGrow scrollable>
        {isEditMode ? (
          <DnDList
            items={items}
            getItemId={item => item.id}
            onChange={(id, { index }) => {
              const order = getNewOrder({
                orders: items.map(item => item.order),
                sourceIndex: items.findIndex(item => item.id === id),
                destinationIndex: index,
              })

              mutate({ id, fields: { order } })

              setItems(prevItems =>
                sortEntitiesWithOrder(
                  prevItems.map(item =>
                    item.id === id ? { ...item, order } : item
                  )
                )
              )
            }}
            renderList={({ props: { children } }) => (
              <VStack gap={cardGap}>{children}</VStack>
            )}
            renderItem={({ item, draggableProps, dragHandleProps, status }) => (
              <DnDItemContainer
                {...draggableProps}
                {...dragHandleProps}
                status={status}
              >
                <AddressBookCard {...item} isEditMode />
                {status === 'overlay' && <DnDItemHighlight />}
              </DnDItemContainer>
            )}
          />
        ) : (
          <VStack gap={cardGap}>
            {items.map(item => (
              <AddressBookCard key={item.id} {...item} />
            ))}
          </VStack>
        )}
      </SettingsPageContent>
      {!isEditMode && (
        <SettingsPageFooter>
          <SettingsCtaButton
            onClick={() => navigate({ id: 'createAddressBookItem' })}
          >
            {t('add_address')}
          </SettingsCtaButton>
        </SettingsPageFooter>
      )}
    </VStack>
  ) : (
    <VStack fullHeight style={{ position: 'relative' }}>
      <SettingsGlow />
      <SettingsPageHeader title={t('address_book')} />
      <EmptyContent gap={12} alignItems="center" justifyContent="center">
        <SettingsBaselineText
          centerHorizontally
          color="contrast"
          height={20 / 16}
          size={16}
          weight={500}
        >
          {t('vault_settings_address_book_no_addresses_title')}
        </SettingsBaselineText>
        <SettingsBaselineText
          centerHorizontally
          color="shy"
          height={18 / 14}
          size={14}
          weight={500}
        >
          {t('vault_settings_address_book_no_addresses_description')}
        </SettingsBaselineText>
        <EmptyAddButton
          onClick={() => navigate({ id: 'createAddressBookItem' })}
        >
          {t('add_address')}
        </EmptyAddButton>
      </EmptyContent>
    </VStack>
  )
}

const penButtonOverhang = (iconButtonSize.md - 20) / 2

// The 32 tap target stays, with the glyph on the frame's 20 slot, 16 from the edge.
const EditButton = styled(IconButton)`
  font-size: 20px;
  margin-right: ${-penButtonOverhang}px;
`

// The frame's text sits 22 below the middle of the area under the header, 265 wide, half a pixel right of center.
const EmptyContent = styled(PageContent)`
  align-self: center;
  left: 0.5px;
  max-width: 297px;
  padding-top: 60px;
  position: relative;
  width: 100%;
`

const EmptyAddButton = styled(SettingsHugCtaButton)`
  margin-top: 18px;
`
