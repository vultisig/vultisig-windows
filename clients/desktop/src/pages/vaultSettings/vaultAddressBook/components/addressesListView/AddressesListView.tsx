import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressBookItem } from '../../../../../lib/types/address-book'
import { useDeleteAddressBookItemMutation } from '../../../../../vault/mutations/useDeleteAddressBookItemMutation'
import { useAddressBookItemsQuery } from '../../../../../vault/queries/useAddressBookItemsQuery'
import { AddressBookPageHeader } from '../../AddressBookSettingsPage.styles'
import ModifyAddressForm from '../modifyAddressForm/ModifyAddressForm'
import AddressBookListItem from './AddressBookListItem/AddressBookListItem'
import { ButtonWrapper, Container, Main } from './AddressesListView.styles'
import { ListContext } from './list-context/useListContext'
import { getItemRegistry } from './utils/getItemRegistry'

type AddressesListViewProps = {
  onOpenAddAddressView: () => void
  isEditModeOn: boolean
  onEditModeToggle: () => void
}

const AddressesListView = ({
  onOpenAddAddressView,
  isEditModeOn,
  onEditModeToggle,
}: AddressesListViewProps) => {
  const [modifyAddressItemId, setModifyAddressItemId] = useState<string | null>(
    null
  )
  const isModifyViewOpen = modifyAddressItemId !== null
  const { t } = useTranslation()
  const {
    data: addressBookItems,
    isFetching: isFetchingAddressBookItems,
    error: addressBookItemsError,
  } = useAddressBookItemsQuery()

  const [items, setItems] = useState<AddressBookItem[]>([])
  const [registry] = useState(getItemRegistry)

  useEffect(() => {
    if (addressBookItems) {
      setItems(addressBookItems)
    }
  }, [addressBookItems])

  const {
    mutate: deleteAddressBookItem,
    isPending: isDeleteAddressBookItemLoading,
    error: deleteAddressBookItemError,
  } = useDeleteAddressBookItemMutation()

  const isLoading = isFetchingAddressBookItems || isDeleteAddressBookItemLoading
  const error = addressBookItemsError || deleteAddressBookItemError
  const itemToModify = useMemo(
    () => items.find(item => item.id === modifyAddressItemId),
    [items, modifyAddressItemId]
  )

  const getItemIndex = useCallback(
    (id: string) => items.findIndex(item => item.id === id),
    [items]
  )

  const reorderItem = useCallback(
    ({
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
    }: {
      startIndex: number
      indexOfTarget: number
      closestEdgeOfTarget: Edge | null
    }) => {
      const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis: 'vertical',
      })

      if (finishIndex === startIndex) {
        return
      }

      setItems(prevItems =>
        reorder({
          list: prevItems,
          startIndex,
          finishIndex,
        })
      )
    },
    []
  )

  const contextValue = useMemo(
    () => ({
      registerItem: registry.register,
      reorderItem,
      getItemIndex,
    }),
    [registry.register, reorderItem, getItemIndex]
  )

  const handleDeleteAddress = (id: string) => {
    void deleteAddressBookItem(id)
  }

  useEffect(() => {
    return monitorForElements({
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]
        if (!target) {
          return
        }

        const sourceData = source.data as { id: string; index: number }
        const targetData = target.data as { id: string; index: number }

        const sourceIndex = sourceData.index
        const targetIndex = targetData.index

        if (
          typeof sourceIndex !== 'number' ||
          typeof targetIndex !== 'number'
        ) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)

        reorderItem({
          startIndex: sourceIndex,
          indexOfTarget: targetIndex,
          closestEdgeOfTarget,
        })
      },
    })
  }, [reorderItem])

  if (isModifyViewOpen && itemToModify) {
    return (
      <>
        <AddressBookPageHeader
          data-testid="ModifyAddressesListView-AddressBookPageHeader"
          primaryControls={
            <PageHeaderBackButton
              onClick={() => setModifyAddressItemId(null)}
            />
          }
          title={
            <PageHeaderTitle>
              {t('vault_settings_address_book_edit_addresses_title')}
            </PageHeaderTitle>
          }
        />
        <ModifyAddressForm
          addressBookItem={itemToModify}
          onClose={() => setModifyAddressItemId(null)}
        />
      </>
    )
  }

  return (
    <>
      <AddressBookPageHeader
        data-testid="AddressesListView-AddressBookPageHeader"
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_settings_address_book')}</PageHeaderTitle>
        }
        secondaryControls={
          isEditModeOn ? (
            <UnstyledButton onClick={onEditModeToggle}>
              <Text color="contrast" size={16} weight={700}>
                {t('done')}
              </Text>
            </UnstyledButton>
          ) : (
            <UnstyledButton onClick={onEditModeToggle}>
              <SquarePenIcon />
            </UnstyledButton>
          )
        }
      />
      <Container>
        <ListContext.Provider value={contextValue}>
          <Main>
            {items.map(({ address, id, title, chain }) => {
              return (
                <AddressBookListItem
                  key={id}
                  id={id}
                  title={title}
                  address={address}
                  chain={chain}
                  isEditModeOn={isEditModeOn}
                  onClick={() => setModifyAddressItemId(id)}
                  handleDeleteAddress={handleDeleteAddress}
                />
              )
            })}
          </Main>
        </ListContext.Provider>
        <ButtonWrapper>
          <Button isLoading={isLoading} onClick={onOpenAddAddressView}>
            {t('add_address')}
          </Button>
          {error && (
            <Text color="danger" size={12}>
              {extractErrorMsg(error)}
            </Text>
          )}
        </ButtonWrapper>
      </Container>
    </>
  )
}

export default AddressesListView
