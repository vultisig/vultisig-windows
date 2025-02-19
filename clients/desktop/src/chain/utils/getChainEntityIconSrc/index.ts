export const getChainEntityIconSrc = (name: string) => {
  if (name.includes('.')) {
    // If name includes an extension, return path without adding any extension
    return `/assets/icons/coins/${name.toLowerCase()}`
  } else {
    // If name doesn't include an extension, add .svg
    return `/assets/icons/coins/${name.toLowerCase()}.svg`
  }
}
