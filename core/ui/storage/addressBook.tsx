import { useCore } from '@core/ui/state/core'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMutation, useQuery } from '@tanstack/react-query'

import {
  CreateAddressBookItemFunction,
  DeleteAddressBookItemFunction,
  UpdateAddressBookItemFunction,
} from './CoreStorage'
import { StorageKey } from './StorageKey'

export const useAddressBookItemsQuery = () => {
  const { getAddressBookItems } = useCore()

  return useQuery({
    queryKey: [StorageKey.addressBookItems],
    queryFn: getAddressBookItems,
    ...fixedDataQueryOptions,
  })
}

export const useAddressBookItems = () => {
  const { data } = useAddressBookItemsQuery()

  return shouldBePresent(data)
}

export const useCreateAddressBookItemMutation = () => {
  const { createAddressBookItem } = useCore()

  const invalidateQueries = useInvalidateQueries()

  const mutationFn: CreateAddressBookItemFunction = async input => {
    await createAddressBookItem(input)
    await invalidateQueries([StorageKey.addressBookItems])
  }

  return useMutation({
    mutationFn,
  })
}

export const useDeleteAddressBookItemMutation = () => {
  const { deleteAddressBookItem } = useCore()

  const invalidateQueries = useInvalidateQueries()

  const mutationFn: DeleteAddressBookItemFunction = async input => {
    await deleteAddressBookItem(input)
    await invalidateQueries([StorageKey.addressBookItems])
  }

  return useMutation({
    mutationFn,
  })
}

export const useUpdateAddressBookItemMutation = () => {
  const { updateAddressBookItem } = useCore()

  const invalidateQueries = useInvalidateQueries()

  const mutationFn: UpdateAddressBookItemFunction = async input => {
    await updateAddressBookItem(input)
    await invalidateQueries([StorageKey.addressBookItems])
  }

  return useMutation({
    mutationFn,
  })
}
