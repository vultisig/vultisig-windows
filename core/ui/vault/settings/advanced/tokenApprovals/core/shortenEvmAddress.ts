/**
 * Shortens an EVM address to `0x` + first four + `…` + last four characters,
 * keeping the body's casing so checksummed addresses read as given.
 */
export const shortenEvmAddress = (address: string) => {
  const body = address.slice(2)

  return `0x${body.slice(0, 4)}…${body.slice(-4)}`
}
