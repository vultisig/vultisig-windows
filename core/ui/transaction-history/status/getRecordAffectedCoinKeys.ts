import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoinKey,
  accountCoinKeyToString,
} from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'

import { TransactionRecord } from '../core'

type GetRecordAffectedCoinKeysInput = {
  record: TransactionRecord
  /**
   * The current vault's native address per chain. Swap records store no
   * destination address, so the receiving side is resolved through this.
   */
  vaultAddresses: Partial<Record<Chain, string>>
}

/**
 * Every balance a confirmed transaction moved, derived from its stored record.
 *
 * Returns nothing for the record types whose lifecycle another tracker owns
 * (`limitSwap`). A trust line moves no token balance, but it still burns the
 * fee, so its fee coin is returned. A swap leg whose chain the vault holds no
 * address for is dropped rather than keyed against `undefined`.
 */
export const getRecordAffectedCoinKeys = ({
  record,
  vaultAddresses,
}: GetRecordAffectedCoinKeysInput): AccountCoinKey[] => {
  const keys: (AccountCoinKey | undefined)[] = matchDiscriminatedUnion(
    record,
    'type',
    'data',
    {
      send: data => [
        { chain: record.chain, id: data.tokenId, address: data.fromAddress },
        { ...chainFeeCoin[record.chain], address: data.fromAddress },
      ],
      swap: data => {
        const fromAddress = vaultAddresses[data.fromChain]
        const toAddress = vaultAddresses[data.toChain]

        const fromKeys: (AccountCoinKey | undefined)[] = fromAddress
          ? [
              {
                chain: data.fromChain,
                id: data.fromTokenId,
                address: fromAddress,
              },
              { ...chainFeeCoin[data.fromChain], address: fromAddress },
            ]
          : []

        const toKeys: (AccountCoinKey | undefined)[] = toAddress
          ? [{ chain: data.toChain, id: data.toTokenId, address: toAddress }]
          : []

        return [...fromKeys, ...toKeys]
      },
      // Owned by `useLimitOrderTracking`: the inbound tx confirms long before
      // the order settles, so a balance read here would be premature.
      limitSwap: () => [],
      trustLine: data => [
        { ...chainFeeCoin[record.chain], address: data.fromAddress },
      ],
    }
  )

  return withoutDuplicates(
    keys.filter(key => key !== undefined),
    (one, another) =>
      accountCoinKeyToString(one) === accountCoinKeyToString(another)
  )
}
