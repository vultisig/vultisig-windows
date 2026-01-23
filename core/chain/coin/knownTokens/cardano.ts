import { KnownCoinMetadata } from '../Coin'

export const knownCardanoTokens: Record<string, KnownCoinMetadata> = {
  // DJED stablecoin
  '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344':
    {
      ticker: 'DJED',
      logo: 'djed',
      decimals: 6,
      priceProviderId: 'djed',
    },
  // SHEN reserve token
  '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd615368656e4d6963726f555344':
    {
      ticker: 'SHEN',
      logo: 'shen',
      decimals: 6,
      priceProviderId: 'shen',
    },
  // MIN token
  '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e': {
    ticker: 'MIN',
    logo: 'min',
    decimals: 6,
    priceProviderId: 'minswap',
  },
  // SUNDAE token
  '9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d7753554e444145': {
    ticker: 'SUNDAE',
    logo: 'sundae',
    decimals: 6,
    priceProviderId: 'sundaeswap',
  },
}
