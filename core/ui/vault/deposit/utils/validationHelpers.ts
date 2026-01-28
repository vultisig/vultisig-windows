import type { TFunction } from 'i18next'
import { z } from 'zod'

export const toOptionalNumber = (value: unknown) => {
  if (value === '' || value === undefined || value === null) return undefined
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const toRequiredNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

export const maxOrInfinity = (value: number) => (value > 0 ? value : 0)

export const positiveAmountSchema = (
  maxValue: number,
  t: TFunction,
  maxMessage?: string
) =>
  z.preprocess(
    toRequiredNumber,
    z
      .number()
      .gt(0, t('amount_must_be_positive'))
      .max(
        maxValue > 0 ? maxValue : Number.POSITIVE_INFINITY,
        maxMessage ?? t('chainFunctions.amountExceeded')
      )
      .superRefine((_val, ctx) => {
        if (maxValue <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('insufficient_balance'),
          })
        }
      })
  )
