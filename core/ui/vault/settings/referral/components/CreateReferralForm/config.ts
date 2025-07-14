import { z } from 'zod'

export const referralSchema = z.object({
  referralName: z
    .string()
    .max(4, 'Max 4 characters')
    .nonempty('Referral code is required'),
  expiration: z.number().min(1, 'Minimum 1 year').max(10, 'Maximum 10 years'),
})

export type ReferralFormData = z.infer<typeof referralSchema>
