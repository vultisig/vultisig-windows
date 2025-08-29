const affiliateTrailingRegex =
  /(::[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*:[0-9]+(?:\/[0-9]+)*)$/

export const buildNestedAffiliateMemo = (
  base: string | undefined,
  primaryName: string,
  primaryBps: number,
  secondary?: { name: string; bps: number }
): string => {
  const memo = base ?? ''
  const head = memo.replace(affiliateTrailingRegex, '')
  if (!secondary) return `${head}::${primaryName}:${primaryBps}`
  return `${head}::${primaryName}/${secondary.name}:${primaryBps}/${secondary.bps}`
}
