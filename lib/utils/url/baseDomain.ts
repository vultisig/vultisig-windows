export const getUrlBaseDomain = (url: string) =>
  new URL(url).hostname.split('.').slice(-2).join('.')
