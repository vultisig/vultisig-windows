import { chainInfos } from '@core/chain/coin/chainInfo'
import {
  getAddressSchema,
  getModifyAddressSchema,
} from '@core/ui/address-book/schemas/addressSchema'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useAddressBookItems } from '@core/ui/storage/addressBook'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

export type AddressFormValues = z.infer<ReturnType<typeof getAddressSchema>>

export const useAddressSchema = ({
  type,
  defaultValues,
}: {
  type: 'add' | 'modify'
  defaultValues?: AddressFormValues
}) => {
  const addressBookItems = useAddressBookItems()
  const walletCore = useAssertWalletCore()
  const { t } = useTranslation()

  const chainOptions = useMemo(() => {
    const coins = Object.values(chainInfos)

    return coins.map(({ chain, ticker, logo }, index) => ({
      value: chain,
      label: ticker,
      logo: logo,
      isLastOption: index === coins.length - 1,
    }))
  }, [])

  const derivedDefaultValues = defaultValues || {
    chain: chainOptions[0].value,
    title: '',
    address: '',
  }

  const addressSchema = useMemo(
    () =>
      type === 'add'
        ? getAddressSchema({
            walletCore,
            addressBookItems,
            t,
          })
        : getModifyAddressSchema({
            walletCore,
            t,
          }),
    [addressBookItems, t, type, walletCore]
  )

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: derivedDefaultValues,
  })

  const watchedChain = useWatch({ control: form.control, name: 'chain' })
  const address = useWatch({ control: form.control, name: 'address' })

  useEffect(() => {
    if (watchedChain && address) {
      form.trigger('address')
    }
  }, [watchedChain, address, form])

  return form
}
