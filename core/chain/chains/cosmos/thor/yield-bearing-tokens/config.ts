export const yieldBearingAssetsIds = ['yRUNE', 'yTCY'] as const
export type YieldBearingAsset = (typeof yieldBearingAssetsIds)[number]

export const yieldBearingAssetsContracts: Record<YieldBearingAsset, string> = {
  yRUNE: 'sthor1qv8n2kz3j4h7w9v5k5w2c5g9q2v7e6xw5g0n6y',
  yTCY: 'sthor1zv9m3kq2v6n8w4x8k8w3c6g0q3v8e7xw9g1n7z',
}

export const yieldBearingAssetsAffiliateContract =
  'sthor1m4pk0kyc5xln5uznsur0d6frlvteghs0v6fyt8pw4vxfhfgskzts2g8ln6'
export const yieldBearingAssetsAffiliateAddress =
  'thor1svfwxevnxtm4ltnw92hrqpqk4vzuzw9a4jzy04'

export const yieldBearingAssetsReceiptDenoms: Record<
  YieldBearingAsset,
  string
> = {
  yRUNE:
    'x/nami-index-nav-sthor1552fjtt2u6evfxwmnx0w68kh7u4fqt7e6vv0du3vj5rwggumy5jsmwzjsr-rcpt',
  yTCY: 'x/nami-index-nav-sthor14t7ns0zs8tfnxe8e0zke96y54g07tlwywgpm s4h3aaftvdtlparskcaflv-rcpt',
}
