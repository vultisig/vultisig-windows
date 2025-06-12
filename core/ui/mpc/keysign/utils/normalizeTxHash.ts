import { Chain, VaultBasedCosmosChain } from '@core/chain/Chain'
import { isOneOf } from '@lib/utils/array/isOneOf'

const memoKeywords = ['switch', 'merge', 'channel']

export const normalizeTxHash = (
  hash: string,
  options: { memo?: string; chain?: Chain }
): string => {
  const { memo, chain } = options
  const has0xPrefix = hash.toLowerCase().startsWith('0x')
  const memoTriggers = memo
    ? memoKeywords.some(keyword => memo.toLowerCase().includes(keyword))
    : false
  const shouldRemove0x = chain
    ? isOneOf(chain, Object.values(VaultBasedCosmosChain))
    : false

  return has0xPrefix && (memoTriggers || shouldRemove0x) ? hash.slice(2) : hash
}
