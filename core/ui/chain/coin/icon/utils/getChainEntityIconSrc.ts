export const getChainEntityIconSrc = (name: string) => {
  const fullName = name.includes('.') ? name : `${name}.svg`
  return `/core/coins/${fullName.toLowerCase()}`
}
