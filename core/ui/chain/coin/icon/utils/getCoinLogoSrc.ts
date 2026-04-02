export const getCoinLogoSrc = (logo: string) => {
  if (logo.startsWith('https://') || logo.startsWith('data:')) {
    return logo
  }

  const fullName = logo.includes('.') ? logo : `${logo}.svg`
  return `/core/coins/${fullName.toLowerCase()}`
}
