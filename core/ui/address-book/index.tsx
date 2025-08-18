import { AddressBookListItem } from '@core/ui/address-book/item'
import { AddressBookItem } from '@core/ui/address-book/model'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useAddressBookItems,
  useUpdateAddressBookItemMutation,
} from '@core/ui/storage/addressBook'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledIcon = styled(TriangleAlertIcon)`
  color: ${getColor('idle')};
`

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
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={isEditMode ? () => setIsEditMode(false) : undefined}
          />
        }
        secondaryControls={
          !isEditMode && (
            <IconButton onClick={() => setIsEditMode(true)}>
              <SquarePenIcon />
            </IconButton>
          )
        }
        title={t('address_book')}
        hasBorder
      />
      <PageContent flexGrow scrollable>
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
            renderList={({ props: { children } }) => <List>{children}</List>}
            renderItem={({ item, draggableProps, dragHandleProps, status }) => (
              <DnDItemContainer
                {...draggableProps}
                {...dragHandleProps}
                status={status}
              >
                <AddressBookListItem {...item} isEditMode />
                {status === 'overlay' && <DnDItemHighlight />}
              </DnDItemContainer>
            )}
          />
        ) : (
          <List>
            {items.map(item => (
              <AddressBookListItem key={item.id} {...item} />
            ))}
          </List>
        )}
      </PageContent>
      {!isEditMode && (
        <PageFooter>
          <Button onClick={() => navigate({ id: 'createAddressBookItem' })}>
            {t('add_address')}
          </Button>
        </PageFooter>
      )}
    </VStack>
  ) : (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('address_book')}
        hasBorder
      />
      <PageContent alignItems="center" justifyContent="center" flexGrow>
        <StyledIcon fontSize={120} />
        <Text color="contrast" size={18} weight={600}>
          {t('vault_settings_address_book_no_addresses_title')}
        </Text>
      </PageContent>
      <PageFooter>
        <Button onClick={() => navigate({ id: 'createAddressBookItem' })}>
          {t('add_address')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
