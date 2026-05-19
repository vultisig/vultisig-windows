import { qbtcRestUrl } from '@vultisig/core-chain/chains/cosmos/qbtc/tendermintRpcUrl'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

type AccountResponse = {
  account: {
    address: string
    account_number: string
    sequence: string
  }
}

/**
 * Quick existence probe for a QBTC address. Only hits
 * `/cosmos/auth/v1beta1/accounts/{addr}` — no latest-block call.
 *
 * Used to decide which claim path to take BEFORE we know we need the full
 * signing metadata. A transient `/blocks/latest` failure must not abort the
 * server-broadcast flow, which doesn't need it.
 */
export const getQbtcAccountExists = async ({
  address,
}: {
  address: string
}): Promise<boolean> => {
  const response = await fetch(
    `${qbtcRestUrl}/cosmos/auth/v1beta1/accounts/${address}`
  )
  if (response.status === 404) return false
  if (!response.ok) {
    throw new Error(
      `Failed to probe QBTC account (${response.status}): ${response.statusText}`
    )
  }
  return true
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
 * Fetches signing metadata (account number, sequence, latest block) for a
 * QBTC address whose on-chain account already exists. Callers MUST check
 * existence with {@link getQbtcAccountExists} first; this helper throws on
 * a 404 because the wallet-direct claim path can't proceed without a real
 * `account_number` (the chain's auto-assigned value is unpredictable and
 * the SignDoc would never verify).
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

  if (accountResponse.status === 404) {
    throw new Error(
      `QBTC account ${address} not found — caller must probe getQbtcAccountExists first`
    )
  }
  if (!accountResponse.ok) {
    throw new Error(
      `Failed to fetch QBTC account (${accountResponse.status}): ${accountResponse.statusText}`
    )
  }
  const data: AccountResponse = await accountResponse.json()
  const accountNumber = Number(data.account.account_number)
  const sequence = Number(data.account.sequence)
  if (!Number.isSafeInteger(accountNumber) || accountNumber < 0) {
    throw new Error(
      `Invalid QBTC account_number for ${address}: ${data.account.account_number}`
    )
  }
  if (!Number.isSafeInteger(sequence) || sequence < 0) {
    throw new Error(
      `Invalid QBTC sequence for ${address}: ${data.account.sequence}`
    )
  }

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
