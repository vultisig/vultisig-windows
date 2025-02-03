import { WalletCore } from '@trustwallet/wallet-core';
import { z } from 'zod';

import { isValidAddress } from '../../../../chain/utils/isValidAddress';
import { AddressBookItem } from '../../../../lib/types/address-book';
import { Chain } from '../../../../model/chain';

export const getAddressSchema = ({
  walletCore,
  addressBookItems,
}: {
  walletCore: WalletCore;
  addressBookItems: AddressBookItem[];
}) =>
  z
    .object({
      title: z
        .string()
        .min(1, 'vault_settings_address_book_title_min_length_error')
        .max(50, 'vault_settings_address_book_title_max_length_error'),
      address: z
        .string()
        .min(1, 'vault_settings_address_book_address_min_length_error'),
      chain: z.string(),
    })
    .superRefine(async (data, ctx) => {
      const { address, chain } = data;

      const isValid = isValidAddress({
        chain: chain as Chain,
        address,
        walletCore,
      });

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'vault_settings_address_book_invalid_address_error',
        });
      }

      const isAddressAlreadyAdded = addressBookItems.some(
        item => item.address === address
      );

      if (isAddressAlreadyAdded) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'vault_settings_address_book_repeated_address_error',
        });
      }
    });
