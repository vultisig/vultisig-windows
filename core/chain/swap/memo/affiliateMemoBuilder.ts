export const affiliateMemoBuilder = (quoteMemo: string, suffix: string) => {
  if (!suffix) return quoteMemo
  const existing = quoteMemo
  return existing.includes('::') ? existing : `${existing}${suffix}`
}
