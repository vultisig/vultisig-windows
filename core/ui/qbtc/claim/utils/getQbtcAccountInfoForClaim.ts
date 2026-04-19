import { qbtcRestUrl } from '@vultisig/core-chain/chains/cosmos/qbtc/tendermintRpcUrl'
import { attempt } from '@vultisig/lib-utils/attempt'
import { HttpResponseError } from '@vultisig/lib-utils/fetch/HttpResponseError'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

type AccountResponse = {
  account: {
    address: string
    account_number: string
    sequence: string
  }
}

type BlockResponse = {
  block: {
    header: {
      height: string
      time: string
    }
  }
}

type QbtcAccountInfoForClaim = {
  address: string
  accountNumber: number
  sequence: number
  latestBlock: string
}

/**
 * Fetches account + latest block info for building a QBTC claim SignDoc.
 *
 * Unlike the SDK's `getQbtcAccountInfo`, this helper treats a 404 on the
 * account lookup as a valid "fresh account" state and defaults both
 * `accountNumber` and `sequence` to 0. A QBTC address doesn't exist
 * on-chain until its first transaction — which for most claimers IS the
 * claim tx.
 *
 * TODO: fold this behaviour back into the SDK's `getQbtcAccountInfo` once
 * iOS/Android agree on the fallback semantics.
 */
export const getQbtcAccountInfoForClaim = async ({
  address,
}: {
  address: string
}): Promise<QbtcAccountInfoForClaim> => {
  const [accountResult, blockData] = await Promise.all([
    attempt(() =>
      queryUrl<AccountResponse>(
        `${qbtcRestUrl}/cosmos/auth/v1beta1/accounts/${address}`
      )
    ),
    queryUrl<BlockResponse>(
      `${qbtcRestUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`
    ),
  ])

  const { accountNumber, sequence } = (() => {
    if ('error' in accountResult) {
      const { error } = accountResult
      if (error instanceof HttpResponseError && error.status === 404) {
        return { accountNumber: 0, sequence: 0 }
      }
      throw error
    }
    return {
      accountNumber: Number(accountResult.data.account.account_number),
      sequence: Number(accountResult.data.account.sequence),
    }
  })()

  const blockTimestampStr = blockData.block.header.time
  const blockTimestampNs =
    BigInt(new Date(blockTimestampStr).getTime()) * 1_000_000n
  const timeoutNs = blockTimestampNs + 600_000_000_000n
  const latestBlock = `${blockData.block.header.height}_${timeoutNs}`

  return {
    address,
    accountNumber,
    sequence,
    latestBlock,
  }
}
