export const isoToNanoseconds = (iso: string): bigint => {
  const [date, nanoStr] = iso.split('.')
  const base = new Date(date + 'Z')
  const seconds = BigInt(Math.floor(base.getTime() / 1000))
  const nanoPart =
    nanoStr?.replace('Z', '').padEnd(9, '0').slice(0, 9) || '000000000'
  return seconds * 1_000_000_000n + BigInt(nanoPart)
}
