import { Chain } from '@core/chain/Chain'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SaveAddressBookItem } from '../../../wailsjs/go/storage/Store'
import { isValidAddress } from '../../chain/utils/isValidAddress'
import { AddressBookItem } from '../../lib/types/address-book'
import {
  addressBookItemsQueryKey,
  useAddressBookItemsQuery,
} from '../queries/useAddressBookItemsQuery'

export const useAddAddressBookItemMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) => {
  const queryClient = useQueryClient()
  const walletCore = useAssertWalletCore()
  const { data: addressBookItems } = useAddressBookItemsQuery()

  return useMutation({
    mutationFn: async (addressBookItem: Omit<AddressBookItem, 'id'>) => {
      const { address, chain } = addressBookItem

      const isValid = isValidAddress({
        chain: chain as Chain,
        address,
        walletCore,
      })

      if (!isValid) {
        throw new Error('vault_settings_address_book_invalid_address_error')
      }

      const isAddressAlreadyAdded = addressBookItems.some(
        item => item.address === addressBookItem.address
      )

      if (isAddressAlreadyAdded) {
        throw new Error('vault_settings_address_book_repeated_address_error')
      }

      return SaveAddressBookItem(addressBookItem as any)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [addressBookItemsQueryKey],
        refetchType: 'all',
      })

      onSuccess?.()
    },
  })
}
