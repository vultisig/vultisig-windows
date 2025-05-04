export const getDappHost = (url?: string) => {
  try {
    if (url) {
      const host = new URL(url).host
      if (host.indexOf('www.') === 0) {
        return host.replace('www.', '')
      }
      return host
    }
    return ''
  } catch {
    return ''
  }
}

export const getDappHostname = (url: string) => {
  try {
    const urlObject = new URL(url)
    let hostname
    const subdomains = urlObject.hostname.split('.')
    if (subdomains.length === 2) {
      hostname = urlObject.hostname
    } else {
      hostname = `${subdomains[subdomains.length - 2]}.${
        subdomains[subdomains.length - 1]
      }`
    }
    return hostname
  } catch {
    return ''
  }
}
