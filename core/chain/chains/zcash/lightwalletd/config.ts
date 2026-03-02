export const zcashLightwalletdUrls = [
  'https://zec.rocks:443',
  'https://mainnet.lightwalletd.com:9067',
  'https://lightwalletd.electriccoin.co:9067',
  'https://lwd1.zcash-infra.com:9067',
  'https://lwd2.zcash-infra.com:9067',
]

export const zcashLightwalletdUrl = zcashLightwalletdUrls[0]

export const lightwalletdService =
  'cash.z.wallet.sdk.rpc.CompactTxStreamer' as const
