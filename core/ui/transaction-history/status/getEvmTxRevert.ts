import { EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'
import { attempt } from '@vultisig/lib-utils/attempt'
import {
  BaseError,
  ExecutionRevertedError,
  isHex,
  RawContractError,
} from 'viem'

export type EvmTxRevert = {
  /** Everything the node and the client said about the revert. */
  text: string
  /** The raw revert payload, when the node returned one. */
  data?: string
}

const hasData = (value: unknown): value is { data: unknown } =>
  typeof value === 'object' && value !== null && 'data' in value

// Viem nests the node's revert payload differently depending on which layer
// wrapped the failure, so the carrier is found by walking the cause chain and
// then unwrapping at most one level of `{ data }`.
const getRevertData = (error: BaseError) => {
  const carrier = error.walk(hasData)
  if (!hasData(carrier)) return undefined

  const { data } = carrier
  if (isHex(data)) return data
  if (hasData(data) && isHex(data.data)) return data.data

  return undefined
}

// The JSON-RPC code every node uses for "the EVM reverted", which some return
// without the `execution reverted` wording viem matches on.
const jsonRpcRevertCode = 3

const hasRevertCode = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  'code' in value &&
  value.code === jsonRpcRevertCode

/**
 * Whether a failed `eth_call` failed because the EVM reverted, rather than
 * because the lookup itself did.
 *
 * A rate limit, a timeout, or a node holding no state for the block are
 * failures of the question, not answers to it — and their messages are prose
 * like any revert's, so reading a reason out of one would be reading it out of
 * the wrong sentence.
 */
const isExecutionRevert = (error: BaseError) =>
  error.walk(
    err =>
      err instanceof ExecutionRevertedError ||
      err instanceof RawContractError ||
      hasRevertCode(err)
  ) !== null

type GetEvmTxRevertInput = {
  chain: EvmChain
  txHash: string
}

/**
 * Recovers why a mined transaction reverted by replaying it with `eth_call` —
 * a receipt records only that it failed, and the reason is stored nowhere on
 * chain.
 *
 * The chain's own receipt decides whether there is anything to explain, never
 * the caller's record: a transaction wrongly stored as failed did in fact land,
 * and replaying it would run against a pool its own swap had already moved,
 * trip the router's minimum, and answer confidently about a swap that
 * succeeded.
 *
 * The replay runs against the end state of the block the transaction was mined
 * in, deliberately including the transactions that shared it. A swap is most
 * often starved of its minimum output by a trade landing just ahead of it in
 * the very same block, and replaying from the block before would step back over
 * that trade and quietly succeed.
 *
 * Returns `undefined` whenever the reason cannot be established: an RPC holding
 * no state for that block cannot replay it, and a replay that succeeds says the
 * failure was not reproducible. Both are silent by design — the caller's job is
 * to explain a failure it recognises, not to guess at one it does not.
 */
export const getEvmTxRevert = async ({
  chain,
  txHash,
}: GetEvmTxRevertInput): Promise<EvmTxRevert | undefined> => {
  if (!isHex(txHash)) return undefined

  const client = getEvmClient(chain)

  const [receipt, tx] = await Promise.all([
    attempt(() => client.getTransactionReceipt({ hash: txHash })),
    attempt(() => client.getTransaction({ hash: txHash })),
  ])

  if ('error' in receipt || receipt.data.status !== 'reverted') return undefined
  if ('error' in tx) return undefined

  const { from, to, input, value, gas, blockNumber } = tx.data
  if (to === null || blockNumber === null) return undefined

  const replay = await attempt(() =>
    client.call({ account: from, to, data: input, value, gas, blockNumber })
  )
  if (!('error' in replay)) return undefined

  const { error } = replay
  if (!(error instanceof BaseError) || !isExecutionRevert(error)) {
    return undefined
  }

  return { text: error.message, data: getRevertData(error) }
}
