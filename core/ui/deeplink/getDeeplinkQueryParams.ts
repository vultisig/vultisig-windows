/** A link's raw query values. Any key may be missing: links are untrusted. */
export type DeeplinkQueryParams = Partial<Record<string, string>>

/**
 * Reads a link's query string without decoding values. Splits each pair on the
 * first `=` only, so an unencoded `=` in a value (e.g. a memo) is kept.
 */
export const getDeeplinkQueryParams = (url: string): DeeplinkQueryParams => {
  const params: DeeplinkQueryParams = {}

  const queryStart = url.indexOf('?')
  if (queryStart === -1) return params

  url
    .slice(queryStart + 1)
    .split('&')
    .forEach(pair => {
      const separator = pair.indexOf('=')
      const key = separator === -1 ? pair : pair.slice(0, separator)
      if (key) params[key] = separator === -1 ? '' : pair.slice(separator + 1)
    })

  return params
}
