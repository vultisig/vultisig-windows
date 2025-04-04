import { Match } from '@lib/ui/base/Match'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'

import { PageSlice } from '../../../ui/page/PageSlice'
import { useAddressBookItemsQuery } from '../../../vault/queries/useAddressBookItemsQuery'
import AddAddressView from './components/addAddressForm/AddAddressForm'
import AddressesListView from './components/addressesListView/AddressesListView'
import EmptyAddressesView from './components/emptyAddressesView/EmptyAddressesView'

const AddressBookSettingsPage = () => {
  const [isAddAddressViewOpen, setIsAddAddressViewOpen] = useState(false)
  const [isEditModeOn, setIsEditModeOn] = useState(false)
  const {
    data: addressBookItems,
    isFetching: isFetchingAddressBookItems,
    refetch,
  } = useAddressBookItemsQuery()

  const handleOpenAddAddressView = () => {
    setIsAddAddressViewOpen(true)
  }

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <VStack flexGrow gap={16}>
      <PageSlice gap={16} flexGrow={true}>
        <Match
          value={
            isFetchingAddressBookItems
              ? 'loading'
              : isAddAddressViewOpen
                ? 'addAddress'
                : addressBookItems.length === 0
                  ? 'empty'
                  : 'list'
          }
          loading={() => <Text>Loading...</Text>}
          addAddress={() => (
            <AddAddressView onClose={() => setIsAddAddressViewOpen(false)} />
          )}
          empty={() => (
            <EmptyAddressesView
              onOpenAddAddressView={handleOpenAddAddressView}
            />
          )}
          list={() => (
            <AddressesListView
              onEditModeToggle={() => setIsEditModeOn(!isEditModeOn)}
              onOpenAddAddressView={handleOpenAddAddressView}
              isEditModeOn={isEditModeOn}
            />
          )}
        />
      </PageSlice>
    </VStack>
  )
}

export default AddressBookSettingsPage
