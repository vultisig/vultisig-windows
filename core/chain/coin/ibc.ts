import { KnownCoinMetadata } from './Coin'

export const ibcTokens: KnownCoinMetadata[] = [
  { ticker: 'KUJI', logo: 'kuji', decimals: 6, priceProviderId: 'kujira' },
  {
    ticker: 'rKUJI',
    logo: 'rkuji.png',
    decimals: 6,
    priceProviderId: 'kujira',
  },
  {
    ticker: 'ASTRO',
    logo: 'terra-astroport.png',
    decimals: 6,
    priceProviderId: 'astroport-fi',
  },
  {
    ticker: 'WINK',
    logo: 'wink.png',
    decimals: 6,
    priceProviderId: 'winkhub',
  },
  {
    ticker: 'LVN',
    logo: 'levana',
    decimals: 6,
    priceProviderId: 'levana-protocol',
  },
  {
    ticker: 'NSTK',
    logo: 'nstk.png',
    decimals: 6,
    priceProviderId: 'unstake-fi',
  },
  {
    ticker: 'NAMI',
    logo: 'nami.png',
    decimals: 6,
    priceProviderId: 'nami-protocol',
  },
  {
    ticker: 'FUZN',
    logo: 'fuzn.png',
    decimals: 6,
    priceProviderId: 'fuzion',
  },
  { ticker: 'USK', logo: 'usk.png', decimals: 6, priceProviderId: 'usk' },
]
