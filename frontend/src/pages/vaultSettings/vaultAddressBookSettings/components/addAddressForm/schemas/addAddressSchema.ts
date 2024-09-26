import { z } from 'zod';

export const addressSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character long.')
    .max(50, 'Title must be at most 50 characters long.'),
  address: z.string().min(1, 'Address must be at least 1 character long.'),
  coinId: z.string(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
