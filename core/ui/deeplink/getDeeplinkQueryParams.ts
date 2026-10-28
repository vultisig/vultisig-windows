/**
 * Reads a link's query string without decoding values. Splits each pair on the
 * first `=` only, so an unencoded `=` in a value (e.g. a memo) is kept.
 */
export const getDeeplinkQueryParams = <T>(url: string): T => {
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return {} as T

  const params: Record<string, string> = {}
  url
    .slice(queryStart + 1)
    .split('&')
    .forEach(pair => {
      const separator = pair.indexOf('=')
      const key = separator === -1 ? pair : pair.slice(0, separator)
      if (key) params[key] = separator === -1 ? '' : pair.slice(separator + 1)
    })

  return params as T
}
