export type SolanaCoingeckoTokenResponse = {
  data: {
    id: string
    type: 'token'
    attributes: {
      coingecko_coin_id: string
    }
  }
}

export type SolanaFmTokenResponse = {
  tokenList?: {
    extensions?: {
      coingeckoId?: string
    } | null
  } | null
}
