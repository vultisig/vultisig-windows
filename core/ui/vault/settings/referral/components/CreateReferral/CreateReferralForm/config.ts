import { z } from 'zod'

export const referralSchema = z.object({
  referralName: z
    .string()
    .max(4, 'Max 4 characters')
    .nonempty('Validated Referral code is required'),
  expiration: z
    .number()
    .min(1, 'Minimum 1 year')
    .max(1000, 'Maximum 1000 years'),
  referralFeeAmount: z.number().min(0.1, 'Minimum 0.1 RUNE'),
})

export type CreateReferralFormData = z.infer<typeof referralSchema>
