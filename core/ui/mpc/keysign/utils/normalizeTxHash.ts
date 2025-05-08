const MEMO_KEYWORDS = ['switch', 'merge', 'channel']

export const normalizeTxHash = (
  hash: string,
  options: { memo?: string }
): string => {
  const { memo } = options
  const has0xPrefix = hash.toLowerCase().startsWith('0x')
  const memoTriggers = memo
    ? MEMO_KEYWORDS.some(keyword => memo.toLowerCase().includes(keyword))
    : false

  return has0xPrefix && memoTriggers ? hash.slice(2) : hash
}
