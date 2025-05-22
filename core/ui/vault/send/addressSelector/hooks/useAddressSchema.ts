import { Chain } from '@core/chain/Chain'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  getAddressSchema,
  getModifyAddressSchema,
} from '../schemas/addressSchema'

export type AddressFormValues = z.infer<ReturnType<typeof getAddressSchema>>

export const useAddressSchema = ({
  type,
  defaultValues,
  chain,
}: {
  type: 'add' | 'modify'
  defaultValues?: AddressFormValues
  chain: Chain
}) => {
  const addressBookItems = useAddressBookItems()
  const walletCore = useAssertWalletCore()
  const { t } = useTranslation()
  const derivedDefaultValues = defaultValues || {
    title: '',
    address: '',
  }

  const addressSchema = useMemo(
    () =>
      type === 'add'
        ? getAddressSchema({
            walletCore,
            addressBookItems,
            chain,
            t,
          })
        : getModifyAddressSchema({
            walletCore,
            chain,
            t,
          }),
    [addressBookItems, chain, t, type, walletCore]
  )

  return useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: derivedDefaultValues,
  })
}
