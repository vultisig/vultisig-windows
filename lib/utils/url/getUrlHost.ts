export const getUrlHost = (url: string) => {
  const { host } = new URL(url)
  return host.replace(/^www\./, '')
}
