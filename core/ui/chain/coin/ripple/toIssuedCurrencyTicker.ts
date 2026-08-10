const hexCurrencyCodeRegex = /^[0-9a-fA-F]{40}$/

/**
 * Readable ticker for an XRPL currency code.
 *
 * A non-standard currency is a 40-char hex code — the ASCII ticker right-padded
 * to 20 bytes — so decoding it recovers what the user recognises (`SOLO` rather
 * than `534F4C4F00…`). Standard 3-character codes and anything that does not
 * decode to printable ASCII pass through untouched, since a code that isn't a
 * ticker should be shown as it is rather than dressed up as one.
 */
export const toIssuedCurrencyTicker = (currency: string): string => {
  if (!hexCurrencyCodeRegex.test(currency)) {
    return currency
  }

  const ascii = Buffer.from(currency, 'hex')
    .toString('ascii')
    .replace(/\0+$/, '')

  return /^[\x20-\x7e]+$/.test(ascii) ? ascii : currency
}
