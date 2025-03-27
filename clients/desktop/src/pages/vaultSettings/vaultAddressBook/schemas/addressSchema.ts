import { Chain } from '@core/chain/Chain'
import { WalletCore } from '@trustwallet/wallet-core'
import type { TFunction } from 'i18next'
import { z } from 'zod'

import { isValidAddress } from '../../../../chain/utils/isValidAddress'
import { AddressBookItem } from '../../../../lib/types/address-book'

export const getAddressSchema = ({
  walletCore,
  addressBookItems,
  t,
}: {
  walletCore: WalletCore
  addressBookItems: AddressBookItem[]
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
      chain: z.string(),
    })
    .superRefine(async (data, ctx) => {
      const { address, chain } = data

      const isValid = isValidAddress({
        chain: chain as Chain,
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
  t,
}: {
  walletCore: WalletCore
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
      chain: z.string(),
    })
    .superRefine(async (data, ctx) => {
      const { address, chain } = data

      const isValid = isValidAddress({
        chain: chain as Chain,
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
