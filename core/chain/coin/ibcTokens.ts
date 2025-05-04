import { Chain } from '../Chain'
import { Coin } from './Coin'

const TOKEN_MERGE_CONTRACTS: Record<string, string> = {
  KUJI: 'thor14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s3p2nzy',
  RKUJI: 'thor1yyca08xqdgvjz0psg56z67ejh9xms6l436u8y58m82npdqqhmmtqrsjrgh',
  FUZN: 'thor1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrsw5xx2d',
  NSTK: 'thor1cnuw3f076wgdyahssdkd0g3nr96ckq8cwa2mh029fn5mgf2fmcmsmam5ck',
  WINK: 'thor1yw4xvtc43me9scqfr2jr2gzvcxd3a9y4eq7gaukreugw2yd2f8tsz3392y',
  LVN: 'thor1ltd0maxmte3xf4zshta9j5djrq9cl692ctsp9u5q0p9wss0f5lms7us4yf',
}

export const IBC_TOKENS = [
  {
    ticker: 'KUJI',
    logo: 'kuji',
    decimals: 6,
    priceProviderId: 'kujira',
    id: 'ibc/4CC44260793F84006656DD868E017578F827A492978161DA31D7572BCB3F4289',
  },
  {
    ticker: 'USDC',
    logo: 'usdc',
    decimals: 6,
    priceProviderId: 'usd-coin',
    id: 'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
  },
  {
    ticker: 'WINK',
    logo: 'wink.png',
    decimals: 6,
    priceProviderId: 'winkhub',
    id: 'ibc/4363FD2EF60A7090E405B79A6C4337C5E9447062972028F5A99FB041B9571942',
  },
  {
    ticker: 'LVN',
    logo: 'levana',
    decimals: 6,
    priceProviderId: 'levana-protocol',
    id: 'ibc/6C95083ADD352D5D47FB4BA427015796E5FEF17A829463AD05ECD392EB38D889',
  },
  {
    ticker: 'NSTK',
    logo: 'nstk.png',
    decimals: 6,
    priceProviderId: 'unstake-fi',
    id: 'ibc/0B99C4EFF1BD05E56DEDEE1D88286DB79680C893724E0E7573BC369D79B5DDF3',
  },
  {
    ticker: 'USK',
    logo: 'usk.png',
    decimals: 6,
    priceProviderId: 'usk',
    id: 'ibc/A47E814B0E8AE12D044637BCB4576FCA675EF66300864873FA712E1B28492B78',
  },
  {
    ticker: 'NAMI',
    logo: 'nami.png',
    decimals: 6,
    priceProviderId: 'nami-protocol',
    id: 'ibc/4622E82B845FFC6AA8B45C1EB2F507133A9E876A5FEA1BA64585D5F564405453',
  },
  {
    ticker: 'FUZN',
    logo: 'fuzn.png',
    decimals: 6,
    priceProviderId: 'fuzion',
    id: 'ibc/6BBBB4B63C51648E9B8567F34505A9D5D8BAAC4C31D768971998BE8C18431C26',
  },
  {
    ticker: 'rKUJI',
    logo: 'rkuji.png',
    decimals: 6,
    priceProviderId: 'kujira',
    id: 'ibc/50A69DC508ACCADE2DAC4B8B09AA6D9C9062FCBFA72BB4C6334367DECD972B06',
  },
]

export const CHAINS_WITH_IBC_TOKENS = [
  Chain.Kujira,
  Chain.Cosmos,
  Chain.Akash,
  Chain.Osmosis,
  Chain.Akash,
  Chain.Dydx,
  Chain.Noble,
]

const mergeTickers = new Set(Object.keys(TOKEN_MERGE_CONTRACTS))

export const getMergeAcceptedTokens = (): (Coin & {
  thorchainAddress: string
})[] => {
  const result: (Coin & { thorchainAddress: string })[] = []

  for (const chain of CHAINS_WITH_IBC_TOKENS) {
    for (const token of IBC_TOKENS) {
      const ticker = token.ticker.toUpperCase()
      const thorchainAddress = TOKEN_MERGE_CONTRACTS[ticker]

      if (mergeTickers.has(ticker) && thorchainAddress) {
        result.push({
          ...token,
          chain,
          thorchainAddress,
        })
      }
    }
  }

  return result
}
