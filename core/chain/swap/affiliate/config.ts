export const baseAffiliateBps = 50

export const vultDiscountTiers = [
  'bronze',
  'silver',
  'gold',
  'platinum',
] as const
export type VultDiscountTier = (typeof vultDiscountTiers)[number]

export const vultDiscountTierMinBalances: Record<VultDiscountTier, number> = {
  bronze: 1000,
  silver: 2500,
  gold: 5000,
  platinum: 10000,
}

export const vultDiscountTierBps: Record<VultDiscountTier, number> = {
  bronze: 10,
  silver: 20,
  gold: 30,
  platinum: 35,
}
