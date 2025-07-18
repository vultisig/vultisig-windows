import { Chain, CosmosChain } from '../../Chain'
import { kujiraCoinsMigratedToThorChainMetadata } from '../../chains/cosmos/thor/kujira-merge'
import { kujiraCoinsOnThorChain } from '../../chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { KnownCoinMetadata } from '../Coin'

export const knownCosmosTokens: Record<
  CosmosChain,
  Record<string, KnownCoinMetadata>
> = {
  [Chain.MayaChain]: {
    maya: {
      ticker: 'MAYA',
      logo: 'maya',
      decimals: 4,
    },
  },
  [Chain.TerraClassic]: {
    uusd: {
      ticker: 'USTC',
      logo: 'ustc.png',
      decimals: 6,
      priceProviderId: 'terrausd',
    },
    terra1xj49zyqrwpv5k928jwfpfy2ha668nwdgkwlrg3: {
      ticker: 'ASTROC',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport',
    },
  },
  [Chain.THORChain]: {
    tcy: {
      ticker: 'TCY',
      logo: 'tcy.png',
      decimals: 8,
      priceProviderId: 'tcy',
    },
    'x/ruji': {
      ticker: 'RUJI',
      logo: 'ruji',
      decimals: 8,
      priceProviderId: 'rujira',
    },
    'bch-bch': {
      ticker: 'BCH',
      logo: 'bch',
      decimals: 8,
      priceProviderId: 'bitcoin-cash',
    },
    'avax-avax': {
      ticker: 'AVAX',
      logo: 'avax',
      decimals: 8,
      priceProviderId: 'avalanche-2',
    },
    'avax-sol-0xfe6b19286885a4f7f55adad09c3cd1f906d2478f': {
      ticker: 'SOL',
      logo: 'solana',
      decimals: 8,
      priceProviderId: 'solana',
    },
    'avax-usdc-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 8,
      priceProviderId: 'usd-coin',
    },
    'base-eth': {
      ticker: 'ETH',
      logo: 'eth',
      decimals: 8,
      priceProviderId: 'ethereum',
    },
    'base-usdc-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 8,
      priceProviderId: 'usd-coin',
    },
    'bsc-bnb': {
      ticker: 'BNB',
      logo: 'bsc',
      decimals: 8,
      priceProviderId: 'binancecoin',
    },
    'bsc-usdc-0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 8,
      priceProviderId: 'usd-coin',
    },
    'bsc-usdt-0x55d398326f99059ff775485246999027b3197955': {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 8,
      priceProviderId: 'tether',
    },
    'btc-btc': {
      ticker: 'BTC',
      logo: 'btc',
      decimals: 8,
      priceProviderId: 'bitcoin',
    },
    'doge-doge': {
      ticker: 'DOGE',
      logo: 'doge',
      decimals: 8,
      priceProviderId: 'dogecoin',
    },
    'eth-aave-0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': {
      ticker: 'AAVE',
      logo: 'aave',
      decimals: 8,
      priceProviderId: 'aave',
    },
    'eth-dai-0x6b175474e89094c44da98b954eedeac495271d0f': {
      ticker: 'DAI',
      logo: 'dai',
      decimals: 8,
      priceProviderId: 'dai',
    },
    'eth-eth': {
      ticker: 'ETH',
      logo: 'eth',
      decimals: 8,
      priceProviderId: 'ethereum',
    },
    'eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 8,
      priceProviderId: 'usd-coin',
    },
    'eth-usdt-0xdac17f958d2ee523a2206206994597c13d831ec7': {
      ticker: 'USDT',
      logo: 'usdt',
      decimals: 8,
      priceProviderId: 'tether',
    },
    'eth-wbtc-0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      ticker: 'WBTC',
      logo: 'wbtc',
      decimals: 8,
      priceProviderId: 'wrapped-bitcoin',
    },
    'gaia-atom': {
      ticker: 'ATOM',
      logo: 'atom',
      decimals: 8,
      priceProviderId: 'cosmos',
    },
    'ltc-ltc': {
      ticker: 'LTC',
      logo: 'ltc',
      decimals: 8,
      priceProviderId: 'litecoin',
    },
    'xrp-xrp': {
      ticker: 'XRP',
      logo: 'xrp',
      decimals: 8,
      priceProviderId: 'ripple',
    },
    ...kujiraCoinsOnThorChain,
  },
  [Chain.Cosmos]: {
    'ibc/F663521BF1836B00F5F177680F74BFB9A8B5654A694D0D2BC249E03CF2509013': {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'usd-coin',
    },
    'ibc/4363FD2EF60A7090E405B79A6C4337C5E9447062972028F5A99FB041B9571942': {
      ...kujiraCoinsMigratedToThorChainMetadata.wink,
      decimals: 6,
    },
    'ibc/6C95083ADD352D5D47FB4BA427015796E5FEF17A829463AD05ECD392EB38D889': {
      ...kujiraCoinsMigratedToThorChainMetadata.lvn,
      decimals: 6,
    },
    'ibc/0B99C4EFF1BD05E56DEDEE1D88286DB79680C893724E0E7573BC369D79B5DDF3': {
      ...kujiraCoinsMigratedToThorChainMetadata.nstk,
      decimals: 6,
    },
    'ibc/A47E814B0E8AE12D044637BCB4576FCA675EF66300864873FA712E1B28492B78': {
      ticker: 'USK',
      logo: 'usk.png',
      decimals: 6,
      priceProviderId: 'usk',
    },
    'ibc/4622E82B845FFC6AA8B45C1EB2F507133A9E876A5FEA1BA64585D5F564405453': {
      ticker: 'NAMI',
      logo: 'nami.png',
      decimals: 6,
      priceProviderId: 'nami-protocol',
    },
    'ibc/6BBBB4B63C51648E9B8567F34505A9D5D8BAAC4C31D768971998BE8C18431C26': {
      ...kujiraCoinsMigratedToThorChainMetadata.fuzn,
      decimals: 6,
    },
    'ibc/50A69DC508ACCADE2DAC4B8B09AA6D9C9062FCBFA72BB4C6334367DECD972B06': {
      ...kujiraCoinsMigratedToThorChainMetadata.rkuji,
      decimals: 6,
    },
    'ibc/4CC44260793F84006656DD868E017578F827A492978161DA31D7572BCB3F4289': {
      decimals: 6,
      ...kujiraCoinsMigratedToThorChainMetadata.kuji,
    },
  },
  [Chain.Osmosis]: {
    uion: {
      ticker: 'ION',
      logo: 'ion',
      decimals: 6,
      priceProviderId: 'ion',
    },
    'factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn':
      {
        ...kujiraCoinsMigratedToThorChainMetadata.lvn,
        decimals: 6,
      },
  },
  [Chain.Kujira]: {
    'factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk':
      {
        ticker: 'USK',
        logo: 'usk.png',
        decimals: 6,
        priceProviderId: 'usk',
      },
    'factory/kujira12cjjeytrqcj25uv349thltcygnp9k0kukpct0e/uwink': {
      ...kujiraCoinsMigratedToThorChainMetadata.wink,
      decimals: 6,
    },
    'factory/kujira1aaudpfr9y23lt9d45hrmskphpdfaq9ajxd3ukh/unstk': {
      ...kujiraCoinsMigratedToThorChainMetadata.nstk,
      decimals: 6,
    },
    'factory/kujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7/umnta': {
      ticker: 'MNTA',
      logo: 'mnta.png',
      decimals: 6,
      priceProviderId: 'mantadao',
    },
    'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9': {
      ticker: 'USDC',
      logo: 'usdc',
      decimals: 6,
      priceProviderId: 'usd-coin',
    },
    'ibc/640E1C3E28FD45F611971DF891AE3DC90C825DF759DF8FAA8F33F7F72B35AD56': {
      ticker: 'ASTRO',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport-fi',
    },
    'ibc/119334C55720942481F458C9C462F5C0CD1F1E7EEAC4679D674AA67221916AEA': {
      ticker: 'LUNC',
      logo: 'lunc',
      decimals: 6,
      priceProviderId: 'terra-luna',
    },
    'factory/kujira1tsekaqv9vmem0zwskmf90gpf0twl6k57e8vdnq/urkuji': {
      ...kujiraCoinsMigratedToThorChainMetadata.rkuji,
      decimals: 6,
    },
    'factory/kujira13x2l25mpkhwnwcwdzzd34cr8fyht9jlj7xu9g4uffe36g3fmln8qkvm3qn/unami':
      {
        ticker: 'NAMI',
        logo: 'NAMI.png',
        decimals: 6,
        priceProviderId: 'nami-protocol',
      },
    'factory/kujira1sc6a0347cc5q3k890jj0pf3ylx2s38rh4sza4t/ufuzn': {
      ...kujiraCoinsMigratedToThorChainMetadata.fuzn,
      decimals: 6,
    },

    'ibc/B64A07C006C0F5E260A8AD50BD53568F1FD4A0D75B7A9F8765C81BEAFDA62053': {
      ...kujiraCoinsMigratedToThorChainMetadata.lvn,
      decimals: 6,
    },
  },
  [Chain.Terra]: {
    terra13j2k5rfkg0qhk58vz63cze0uze4hwswlrfnm0fa4rnyggjyfrcnqcrs5z2: {
      ticker: 'TPT',
      logo: 'terra-poker-token.png',
      decimals: 6,
      priceProviderId: 'tpt',
    },
    'ibc/8D8A7F7253615E5F76CB6252A1E1BD921D5EDB7BBAAF8913FB1C77FF125D9995': {
      ticker: 'ASTRO-IBC',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport-fi',
    },
    terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26: {
      ticker: 'ASTRO',
      logo: 'terra-astroport.png',
      decimals: 6,
      priceProviderId: 'astroport-fi',
    },
  },
  [Chain.Dydx]: {},
  [Chain.Noble]: {},
  [Chain.Akash]: {},
}
