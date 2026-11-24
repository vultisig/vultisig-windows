import { Chain } from '@vultisig/core-chain/Chain'
import { isTonGaslessRequest } from '@vultisig/core-chain/chains/ton/gasless/request'
import { Tx } from '@vultisig/core-chain/tx'

import { findTonGaslessTraceId } from './findTonGaslessTraceId'

type GetKeysignTxHashInput = {
  chain: Chain
  tx: Tx
  broadcastTxHash?: string
}

const isTonGaslessTx = ({
  chain,
  tx: { data },
}: Pick<GetKeysignTxHashInput, 'chain' | 'tx'>) =>
  chain === Chain.Ton &&
  'encoded' in data &&
  typeof data.encoded === 'string' &&
  isTonGaslessRequest(data.encoded)

/**
 * The hash to show and record for a broadcast tx. Gasless TON (W5) gets the
 * relay's trace id, since explorers don't index the compiled body hash: the
 * one the relay reported, or, when the broadcast fell back to the body hash
 * (the relay reported none, or another device's request reached it first),
 * the one the indexer finds for that body. Everything else keeps its
 * compiled hash.
 */
export const getKeysignTxHash = async ({
  chain,
  tx,
  broadcastTxHash,
}: GetKeysignTxHashInput): Promise<string> => {
  if (!isTonGaslessTx({ chain, tx })) {
    return tx.hash
  }

  if (broadcastTxHash && broadcastTxHash !== tx.hash) {
    return broadcastTxHash
  }

  return (await findTonGaslessTraceId(tx.hash)) ?? tx.hash
}
