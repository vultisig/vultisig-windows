import { useCore } from '@core/ui/state/core'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMutation, useQuery } from '@tanstack/react-query'

import { addressBookItemsQueryKey } from '../query/keys'
import {
  CreateAddressBookItemFunction,
  DeleteAddressBookItemFunction,
  UpdateAddressBookItemFunction,
} from './CoreStorage'

export const useAddressBookItemsQuery = () => {
  const { getAddressBookItems } = useCore()

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
  const { createAddressBookItem } = useCore()

  const invalidateQueries = useInvalidateQueries()

  const mutationFn: CreateAddressBookItemFunction = async input => {
    await createAddressBookItem(input)
    await invalidateQueries(addressBookItemsQueryKey)
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
    await invalidateQueries(addressBookItemsQueryKey)
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
    await invalidateQueries(addressBookItemsQueryKey)
  }

  return useMutation({
    mutationFn,
  })
}
