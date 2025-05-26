export const getCoinLogoSrc = (logo: string) => {
  if (logo.startsWith('https://')) {
    return logo
  }

  const fullName = logo.includes('.') ? logo : `${logo}.svg`
  return `/core/coins/${fullName.toLowerCase()}`
}
