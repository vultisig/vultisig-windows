import { getChainEntityIconSrc } from '@core/chain/utils/getChainEntityIconSrc'

export const getCoinLogoSrc = (logo: string) => {
  if (logo.startsWith('https://')) {
    return logo
  }
  return getChainEntityIconSrc(logo)
}
