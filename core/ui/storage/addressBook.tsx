import { AddressBookItem } from '@core/ui/address-book/model'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const initialAddressBookItems: AddressBookItem[] = []

export type GetAddressBookItemsFunction = () => Promise<AddressBookItem[]>

type CreateAddressBookItemInput = AddressBookItem

type CreateAddressBookItemFunction = (
  input: CreateAddressBookItemInput
) => Promise<void>

type UpdateAddressBookItemInput = {
  id: string
  fields: Partial<Omit<AddressBookItem, 'id'>>
}

type UpdateAddressBookItemFunction = (
  input: UpdateAddressBookItemInput
) => Promise<void>

type DeleteAddressBookItemFunction = (itemId: string) => Promise<void>

export type AddressBookStorage = {
  getAddressBookItems: GetAddressBookItemsFunction
  createAddressBookItem: CreateAddressBookItemFunction
  updateAddressBookItem: UpdateAddressBookItemFunction
  deleteAddressBookItem: DeleteAddressBookItemFunction
}

export const useAddressBookItemsQuery = () => {
  const { getAddressBookItems } = useCore()

  return useQuery({
    queryKey: [StorageKey.addressBookItems],
    queryFn: async () => {
      const addresses = await getAddressBookItems()

      return sortEntitiesWithOrder(addresses)
    },
    ...noRefetchQueryOptions,
  })
}

export const useAddressBookItems = () => {
  const { data } = useAddressBookItemsQuery()

  return shouldBePresent(data)
}

export const useAddressBookItemOrders = () => {
  const addressBookItems = useAddressBookItems()

  return useMemo(() => addressBookItems.map(v => v.order), [addressBookItems])
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
