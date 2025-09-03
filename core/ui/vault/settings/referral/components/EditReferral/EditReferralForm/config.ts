import { Chain } from '@core/chain/Chain'
import { z } from 'zod'

const accountCoinSchema = z.object({
  chain: z.nativeEnum(Chain),
  id: z.string(),
  address: z.string(),
})

export const editReferralSchema = z.object({
  expiration: z
    .number()
    .min(1, 'Minimum 1 year')
    .max(1000, 'Maximum 1000 years'),
  referralFeeAmount: z.number().min(0, 'Minimum 0 RUNE'),
  payoutAsset: accountCoinSchema.optional(),
})

export type EditReferralFormData = z.infer<typeof editReferralSchema>

const poolChainMap: Record<string, string> = {
  AVAX: 'Avalanche',
  BASE: 'Base',
  BCH: 'Bitcoin‑Cash',
  BTC: 'Bitcoin',
  DOGE: 'Dogecoin',
  ETH: 'Ethereum',
  GAIA: 'Cosmos',
  LTC: 'Litecoin',
  THOR: 'THORChain',
  XRP: 'XRP Ledger',
}

export const normaliseChainToMatchPoolChain = (c: string) =>
  (poolChainMap[c.toUpperCase()] ?? c).toUpperCase()
