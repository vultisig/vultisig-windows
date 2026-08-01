import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
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

const maxOrInfinity = (value: number) => (value > 0 ? value : 0)

/**
 * Normalizes an amount field to its decimal-string representation without
 * losing precision. The string is what gets submitted — parsing it with
 * `Number()` would corrupt amounts with more than ~15 significant digits
 * (#4494), so floats are only used for bounds checks, never as the value.
 */
const toAmountString = (value: unknown): string => {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

const toOptionalAmountString = (value: unknown) => {
  const amountString = toAmountString(value)
  return amountString === '' ? undefined : amountString
}

/** Required positive amount with no balance cap (e.g. trust-line limits). */
export const requiredAmountSchema = (t: TFunction) =>
  z.preprocess(
    toAmountString,
    z.string().refine(value => {
      const parsed = Number(value)
      return Number.isFinite(parsed) && parsed > 0
    }, t('amount_must_be_positive'))
  )

/** Optional positive amount capped at maxValue when present. */
export const optionalPositiveAmountSchema = (maxValue: number, t: TFunction) =>
  z.preprocess(
    toOptionalAmountString,
    z
      .string()
      .refine(value => {
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed > 0
      }, t('amount_must_be_positive'))
      .refine(
        value => Number(value) <= maxOrInfinity(maxValue),
        t('chainFunctions.amountExceeded')
      )
      .optional()
  )

/** Optional non-negative amount capped at maxValue when present. */
export const optionalNonNegativeAmountSchema = (
  maxValue: number,
  t: TFunction
) =>
  z.preprocess(
    toOptionalAmountString,
    z
      .string()
      .refine(value => {
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed >= 0
      }, t('amount_must_be_non_negative'))
      .refine(
        value => Number(value) <= maxOrInfinity(maxValue),
        t('chainFunctions.amountExceeded')
      )
      .optional()
  )

/** Exact balance cap in chain base units, for float-free max validation. */
type ChainAmountMax = {
  units: bigint
  decimals: number
}

export const positiveAmountSchema = (
  maxValue: number,
  t: TFunction,
  maxMessage?: string,
  chainAmountMax?: ChainAmountMax
) =>
  z.preprocess(
    toAmountString,
    z
      .string()
      .refine(value => {
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed > 0
      }, t('amount_must_be_positive'))
      .refine(
        value => {
          // Compare in base units when the exact balance is known — a float
          // compare can accept an amount a few base units above the true
          // balance when both round to the same float64 (#4496)
          if (chainAmountMax && chainAmountMax.units > 0n) {
            try {
              return (
                decimalStringToBigInt(value, chainAmountMax.decimals) <=
                chainAmountMax.units
              )
            } catch {
              // more fraction digits than the coin supports — fall through to
              // the float check, matching previous behavior for such input
            }
          }
          return (
            Number(value) <=
            (maxValue > 0 ? maxValue : Number.POSITIVE_INFINITY)
          )
        },
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
