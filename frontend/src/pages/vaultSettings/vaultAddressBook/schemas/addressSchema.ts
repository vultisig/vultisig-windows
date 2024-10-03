import { z } from 'zod';

export const addressSchema = z.object({
  title: z
    .string()
    .min(1, 'vault_settings_address_book_title_min_length_error')
    .max(50, 'vault_settings_address_book_title_max_length_error'),
  address: z
    .string()
    .min(1, 'vault_settings_address_book_address_min_length_error'),
  chain: z.string(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
