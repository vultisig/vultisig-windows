import { z } from 'zod';

import { isValidAddress } from '../../../../../../lib/hooks/useAddressBook/utils/isValidAddress';

export const addressSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title must be at least 1 character long.')
      .max(50, 'Title must be at most 50 characters long.'),
    address: z.string().min(1, 'Address must be at least 1 character long.'),
    coinSymbol: z
      .string()
      .min(1, 'Coin symbol must be at least 1 character long.'),
  })
  .refine(data => isValidAddress(data.address, data.coinSymbol), {
    message: 'Invalid address format',
    path: ['address'],
  });

export type Address = z.infer<typeof addressSchema>;
