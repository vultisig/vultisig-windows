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
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
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
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
              <PencilIcon />
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
            renderList={({ props: { children } }) => (
              <AddressBookEditList>{children}</AddressBookEditList>
            )}
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
      <PageContent
        style={{
          maxWidth: 265,
          marginInline: 'auto',
        }}
        gap={12}
        alignItems="center"
        justifyContent="center"
        flexGrow
      >
        <Text centerHorizontally color="contrast" size={16} weight={500}>
          {t('vault_settings_address_book_no_addresses_title')}
        </Text>
        <Text centerHorizontally color="shy" size={14} weight={500}>
          {t('vault_settings_address_book_no_addresses_description')}
        </Text>
        <Button
          style={{
            alignSelf: 'center',
            width: 151,
            fontSize: 14,
          }}
          onClick={() => navigate({ id: 'createAddressBookItem' })}
        >
          {t('add_address')}
        </Button>
      </PageContent>
    </VStack>
  )
}

const AddressBookEditList = styled(List)`
  background: none;
`
