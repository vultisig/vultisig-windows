const evmPrefix = '0x'

/**
 * Shortens an address to its first and last four characters (after `0x` for
 * EVM), keeping the casing so checksummed addresses read as given.
 */
export const shortenAddress = (address: string) => {
  const prefix = address.startsWith(evmPrefix) ? evmPrefix : ''
  const body = address.slice(prefix.length)

  return `${prefix}${body.slice(0, 4)}…${body.slice(-4)}`
}
