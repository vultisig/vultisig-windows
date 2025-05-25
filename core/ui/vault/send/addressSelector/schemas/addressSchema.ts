import { Chain } from '@core/chain/Chain'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { AddressBookItem } from '@core/ui/addressBook/AddressBookItem'
import { WalletCore } from '@trustwallet/wallet-core'
import type { TFunction } from 'i18next'
import { z } from 'zod'

export const getAddressSchema = ({
  walletCore,
  addressBookItems,
  chain,
  t,
}: {
  walletCore: WalletCore
  addressBookItems: AddressBookItem[]
  chain: Chain
  t: TFunction
}) =>
  z
    .object({
      title: z
        .string()
        .min(1, t('vault_settings_address_book_title_min_length_error'))
        .max(50, t('vault_settings_address_book_title_max_length_error')),
      address: z
        .string()
        .min(1, t('vault_settings_address_book_address_min_length_error')),
    })
    .superRefine(async (data, ctx) => {
      const { address } = data

      const isValid = isValidAddress({
        chain,
        address,
        walletCore,
      })

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: t('vault_settings_address_book_invalid_address_error'),
        })
      }

      const isAddressAlreadyAdded = addressBookItems.some(
        item => item.address === address
      )

      if (isAddressAlreadyAdded) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: t('vault_settings_address_book_repeated_address_error'),
        })
      }
    })

export const getModifyAddressSchema = ({
  walletCore,
  chain,
  t,
}: {
  walletCore: WalletCore
  chain: Chain
  t: TFunction
}) =>
  z
    .object({
      title: z
        .string()
        .min(1, t('vault_settings_address_book_title_min_length_error'))
        .max(50, t('vault_settings_address_book_title_max_length_error')),
      address: z
        .string()
        .min(1, t('vault_settings_address_book_address_min_length_error')),
    })
    .superRefine(async (data, ctx) => {
      const { address } = data

      const isValid = isValidAddress({
        chain,
        address,
        walletCore,
      })

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: t('vault_settings_address_book_invalid_address_error'),
        })
      }
    })
