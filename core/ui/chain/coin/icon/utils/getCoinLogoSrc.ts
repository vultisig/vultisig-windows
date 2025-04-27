import { getChainEntityIconSrc } from './getChainEntityIconSrc'

export const getCoinLogoSrc = (logo: string) => {
  if (logo.startsWith('https://')) {
    return logo
  }
  return getChainEntityIconSrc(logo)
}
