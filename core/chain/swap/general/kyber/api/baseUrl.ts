import { Chain } from '../../../../Chain'

export const getKyberSwapBaseUrl = (chain: Chain) =>
  `https://aggregator-api.kyberswap.com/${chain.toLowerCase()}/api/v1`
