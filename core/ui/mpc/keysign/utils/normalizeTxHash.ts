import { Chain } from '@core/chain/Chain'

const memoKeywords = ['switch', 'merge', 'channel']
const no0xChains = ['THORChain', 'MayaChain']

export const normalizeTxHash = (
  hash: string,
  options: { memo?: string; chain?: Chain }
): string => {
  const { memo, chain } = options
  const has0xPrefix = hash.toLowerCase().startsWith('0x')
  const memoTriggers = memo
    ? memoKeywords.some(keyword => memo.toLowerCase().includes(keyword))
    : false
  const shouldRemove0x = chain ? no0xChains.includes(chain) : false

  return has0xPrefix && (memoTriggers || shouldRemove0x) ? hash.slice(2) : hash
}
