import { useAddressBookItems } from '@core/ui/storage/addressBook'
import AddAddressForm from '@core/ui/vault/send/addressSelector/components/addAddressForm/AddAddressForm'
import { Match } from '@lib/ui/base/Match'
import { VStack } from '@lib/ui/layout/Stack'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { useState } from 'react'

import AddressesListView from './components/addressesListView/AddressesListView'
import EmptyAddressesView from './components/emptyAddressesView/EmptyAddressesView'

const AddressBookSettingsPage = () => {
  const [isAddAddressViewOpen, setIsAddAddressViewOpen] = useState(false)
  const [isEditModeOn, setIsEditModeOn] = useState(false)
  const addressBookItems = useAddressBookItems()

  const handleOpenAddAddressView = () => {
    setIsAddAddressViewOpen(true)
  }

  return (
    <VStack flexGrow gap={16} fullHeight>
      <PageSlice gap={16} flexGrow={true}>
        <Match
          value={
            isAddAddressViewOpen
              ? 'addAddress'
              : addressBookItems.length === 0
                ? 'empty'
                : 'list'
          }
          addAddress={() => (
            <AddAddressForm onClose={() => setIsAddAddressViewOpen(false)} />
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
