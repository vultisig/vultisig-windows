import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'

import { getFeeCoinKey, withoutDuplicateCoinKeys } from '../coinKeys'
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
 * Every balance a settled transaction moved, derived from its stored record.
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
  const keys: AccountCoinKey[] = matchDiscriminatedUnion(
    record,
    'type',
    'data',
    {
      send: data => [
        { chain: record.chain, id: data.tokenId, address: data.fromAddress },
        getFeeCoinKey({ chain: record.chain, address: data.fromAddress }),
      ],
      swap: data => {
        const fromAddress = vaultAddresses[data.fromChain]
        const toAddress = vaultAddresses[data.toChain]

        const fromKeys: AccountCoinKey[] = fromAddress
          ? [
              {
                chain: data.fromChain,
                id: data.fromTokenId,
                address: fromAddress,
              },
              getFeeCoinKey({ chain: data.fromChain, address: fromAddress }),
            ]
          : []

        const toKeys: AccountCoinKey[] = toAddress
          ? [{ chain: data.toChain, id: data.toTokenId, address: toAddress }]
          : []

        return [...fromKeys, ...toKeys]
      },
      // Owned by `useLimitOrderTracking`: the inbound tx confirms long before
      // the order settles, so a balance read here would be premature.
      limitSwap: () => [],
      trustLine: data => [
        getFeeCoinKey({ chain: record.chain, address: data.fromAddress }),
      ],
    }
  )

  return withoutDuplicateCoinKeys(keys)
}
