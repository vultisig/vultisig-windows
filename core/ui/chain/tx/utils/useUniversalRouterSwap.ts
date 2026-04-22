import { useGetCoin } from '@core/ui/chain/coin/useGetCoin'
import { useQuery } from '@tanstack/react-query'
import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { decodeUniversalRouterExecute } from '@vultisig/core-chain/chains/evm/contract/universalRouter/decode'
import { NATIVE_TOKEN_ADDRESS } from '@vultisig/core-chain/chains/evm/contract/universalRouter/opcodes'
import { UniversalRouterSwapIntent } from '@vultisig/core-chain/chains/evm/contract/universalRouter/types'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

type ResolvedUniversalRouterSwap = {
  fromCoin: Coin
  toCoin: Coin
  fromAmount: bigint
  toAmount: bigint
  isExactOut: boolean
}

type UseUniversalRouterSwapInput = {
  memo: string | undefined
  chain: Chain
}

const evmChains = Object.values(EvmChain)

const decodeForEvm = (
  memo: string | undefined,
  chain: Chain
): { intent: UniversalRouterSwapIntent; chain: EvmChain } | null => {
  if (!memo || !memo.startsWith('0x') || memo.length < 10) return null
  if (!isOneOf(chain, evmChains)) return null
  const intent = decodeUniversalRouterExecute(memo)
  if (!intent) return null
  return { intent, chain }
}

/**
 * Decode a Uniswap Universal Router `execute` memo and resolve both ends
 * to full `Coin` metadata — walking vault coins, `knownTokens`, and finally
 * on-chain ERC-20 discovery via `useGetCoin`. Returns the resolved swap, a
 * loading flag, and a null result when the memo isn't a UR call or when
 * either token can't be resolved.
 */
export const useUniversalRouterSwap = ({
  memo,
  chain,
}: UseUniversalRouterSwapInput): {
  data: ResolvedUniversalRouterSwap | null
  isPending: boolean
} => {
  const getCoin = useGetCoin()

  const decoded = decodeForEvm(memo, chain)

  const query = useQuery({
    queryKey: [
      'universalRouterSwap',
      chain,
      decoded?.intent.fromToken,
      decoded?.intent.toToken,
    ],
    queryFn: async (): Promise<ResolvedUniversalRouterSwap | null> => {
      if (!decoded) return null
      const { intent, chain: evmChain } = decoded

      const toCoinKey = (address: string) =>
        address === NATIVE_TOKEN_ADDRESS
          ? { chain: evmChain }
          : { chain: evmChain, id: address }

      const [fromCoin, toCoin] = await Promise.all([
        getCoin(toCoinKey(intent.fromToken)),
        getCoin(toCoinKey(intent.toToken)),
      ])

      return {
        fromCoin,
        toCoin,
        fromAmount: intent.amountIn,
        toAmount: intent.amountOutMin,
        isExactOut: intent.isExactOut,
      }
    },
    enabled: !!decoded,
    staleTime: Infinity,
    // Token metadata discovery is best-effort; if it fails, fall through to
    // the 4byte path rather than retrying and delaying the verify screen.
    retry: false,
  })

  return {
    data: query.data ?? null,
    isPending: query.isPending && !!decoded,
  }
}
