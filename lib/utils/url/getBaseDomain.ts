export const getBaseDomain = (url: string) =>
  new URL(url).hostname.split('.').slice(-2).join('.')
