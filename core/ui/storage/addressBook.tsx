import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMutation, useQuery } from '@tanstack/react-query'

import { addressBookItemsQueryKey } from '../query/keys'
import { useCoreStorage } from '../state/storage'

export const useAddressBookItemsQuery = () => {
  const { getAddressBookItems } = useCoreStorage()

  return useQuery({
    queryKey: addressBookItemsQueryKey,
    queryFn: getAddressBookItems,
  })
}

export const useAddressBookItems = () => {
  const { data } = useAddressBookItemsQuery()

  return shouldBePresent(data)
}

export const useCreateAddressBookItemMutation = () => {
  const { createAddressBookItem } = useCoreStorage()

  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: createAddressBookItem,
    onSuccess: () => {
      invalidateQueries(addressBookItemsQueryKey)
    },
  })
}

export const useDeleteAddressBookItemMutation = () => {
  const { deleteAddressBookItem } = useCoreStorage()

  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: deleteAddressBookItem,
    onSuccess: () => {
      invalidateQueries(addressBookItemsQueryKey)
    },
  })
}

export const useUpdateAddressBookItemMutation = () => {
  const { updateAddressBookItem } = useCoreStorage()

  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: updateAddressBookItem,
    onSuccess: () => {
      invalidateQueries(addressBookItemsQueryKey)
    },
  })
}
