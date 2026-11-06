import { Chain } from '@vultisig/core-chain/Chain'
import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'

import { TransactionRecord } from '../core'

type IsRecordOnChainInput = {
  record: TransactionRecord
  chain: Chain
}

/**
 * Whether a chain's history lists this record. A swap is listed on the chain
 * of either coin, so an ETH to BTC swap shows on Ethereum and on Bitcoin.
 * `record.chain` is not used for a swap: on a native swap it is THORChain or
 * MayaChain, where neither coin may be. Every other record is listed only on
 * the chain it was filed under.
 */
export const isRecordOnChain = ({
  record,
  chain,
}: IsRecordOnChainInput): boolean =>
  matchDiscriminatedUnion(record, 'type', 'data', {
    swap: ({ fromChain, toChain }) => chain === fromChain || chain === toChain,
    send: () => chain === record.chain,
    limitSwap: () => chain === record.chain,
    trustLine: () => chain === record.chain,
  })
