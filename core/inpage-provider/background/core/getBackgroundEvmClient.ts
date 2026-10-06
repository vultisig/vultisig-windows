import { EvmChain } from '@vultisig/core-chain/Chain'
import {
  evmChainInfo,
  getEvmRpcUrl,
} from '@vultisig/core-chain/chains/evm/chainInfo'
import { memoize } from '@vultisig/lib-utils/memoize'
import { createClient, http } from 'viem'

/**
 * JSON-RPC client for background resolvers that only need `request`.
 *
 * The background freezes `Function.prototype` and the other built-ins at
 * startup, and viem's public-client decorators assign `.call` onto functions,
 * which a frozen prototype rejects. The base client skips those decorators, so
 * it keeps working under the freeze. Use this instead of `getEvmClient` in
 * the background.
 */
export const getBackgroundEvmClient = memoize(
  (chain: EvmChain) =>
    createClient({
      chain: evmChainInfo[chain],
      transport: http(getEvmRpcUrl(chain)),
    }),
  (chain: EvmChain) => `${chain}:${getEvmRpcUrl(chain)}`
)
