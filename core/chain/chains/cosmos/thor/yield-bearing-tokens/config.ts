export const yieldBearingAssetsIds = ['yRUNE', 'yTCY'] as const
type YieldBearingAsset = (typeof yieldBearingAssetsIds)[number]

// MAINNET contracts
export const yieldBearingAssetsContracts: Record<YieldBearingAsset, string> = {
  yRUNE: 'thor1mlphkryw5g54yfkrp6xpqzlpv4f8wh6hyw27yyg4z2els8a9gxpqhfhekt',
  yTCY: 'thor1h0hr0rm3dawkedh44hlrmgvya6plsryehcr46yda2vj0wfwgq5xqrs86px',
}

// MAINNET affiliate contract + your affiliate address
export const yieldBearingAssetsAffiliateContract =
  'thor1v3f7h384r8hw6r3dtcgfq6d5fq842u6cjzeuu8nr0cp93j7zfxyquyrfl8'
export const yieldBearingAssetsAffiliateAddress =
  'thor1svfwxevnxtm4ltnw92hrqpqk4vzuzw9a4jzy04'

// MAINNET receipt denoms
export const yieldBearingAssetsReceiptDenoms: Record<
  YieldBearingAsset,
  string
> = {
  yRUNE:
    'x/nami-index-nav-thor1mlphkryw5g54yfkrp6xpqzlpv4f8wh6hyw27yyg4z2els8a9gxpqhfhekt-rcpt',
  yTCY: 'x/nami-index-nav-thor1h0hr0rm3dawkedh44hlrmgvya6plsryehcr46yda2vj0wfwgq5xqrs86px-rcpt',
}
