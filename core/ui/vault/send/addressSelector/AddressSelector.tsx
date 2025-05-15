import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { Match } from '@lib/ui/base/Match'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { useState } from 'react'

import EmptyAddressesView from '../../vaultAddressBook/components/emptyAddressesView/EmptyAddressesView'
import { Wrapper } from './AddressSelector.styles'
import AddAddressView from './components/addAddressForm/AddAddressForm'
import AddressesListView from './components/addressesListView/AddressesListView'

type AddressSelectorProps = {
  onAddressClick: (address: string) => void
  onClose: () => void
}

const AddressSelector = ({ onAddressClick, onClose }: AddressSelectorProps) => {
  const [isAddAddressViewOpen, setIsAddAddressViewOpen] = useState(false)
  const [isEditModeOn, setIsEditModeOn] = useState(false)
  const addressBookItems = useAddressBookItems()

  const handleOpenAddAddressView = () => {
    setIsAddAddressViewOpen(true)
  }

  return (
    <Wrapper flexGrow gap={16}>
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
            <AddAddressView onClose={() => setIsAddAddressViewOpen(false)} />
          )}
          empty={() => (
            <EmptyAddressesView
              onOpenAddAddressView={handleOpenAddAddressView}
            />
          )}
          list={() => (
            <AddressesListView
              onClick={onAddressClick}
              onClose={onClose}
              onEditModeToggle={() => setIsEditModeOn(!isEditModeOn)}
              onOpenAddAddressView={handleOpenAddAddressView}
              isEditModeOn={isEditModeOn}
            />
          )}
        />
      </PageSlice>
    </Wrapper>
  )
}

export default AddressSelector
