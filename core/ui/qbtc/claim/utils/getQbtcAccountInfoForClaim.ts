import { qbtcRestUrl } from '@vultisig/core-chain/chains/cosmos/qbtc/tendermintRpcUrl'
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
 * Uses a raw `fetch` for the account endpoint so a 404 can be branched on
 * `response.status` directly instead of relying on a typed error class.
 *
 * TODO: fold this behaviour back into the SDK's `getQbtcAccountInfo` once
 * iOS/Android agree on the fallback semantics.
 */
export const getQbtcAccountInfoForClaim = async ({
  address,
}: {
  address: string
}): Promise<QbtcAccountInfoForClaim> => {
  const accountUrl = `${qbtcRestUrl}/cosmos/auth/v1beta1/accounts/${address}`

  const [accountResponse, blockData] = await Promise.all([
    fetch(accountUrl),
    queryUrl<BlockResponse>(
      `${qbtcRestUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`
    ),
  ])

  const { accountNumber, sequence } = await (async () => {
    if (accountResponse.status === 404) {
      return { accountNumber: 0, sequence: 0 }
    }
    if (!accountResponse.ok) {
      throw new Error(
        `Failed to fetch QBTC account (${accountResponse.status}): ${accountResponse.statusText}`
      )
    }
    const data: AccountResponse = await accountResponse.json()
    return {
      accountNumber: Number(data.account.account_number),
      sequence: Number(data.account.sequence),
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
