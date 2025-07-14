import { Chain } from '@core/chain/Chain'
import { z } from 'zod'

const accountCoinSchema = z.object({
  chain: z.nativeEnum(Chain),
  id: z.string(),
  address: z.string(),
})

export const referralSchema = z.object({
  referralName: z
    .string()
    .max(4, 'Max 4 characters')
    .nonempty('Referral code is required'),
  expiration: z.number().min(1, 'Minimum 1 year').max(10, 'Maximum 10 years'),
})

export type ReferralFormData = z.infer<typeof referralSchema>
