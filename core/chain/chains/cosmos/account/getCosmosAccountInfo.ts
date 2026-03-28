import { Chain, CosmosChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { queryUrl } from '@lib/utils/query/queryUrl'

type RestAccountResponse = {
  account: {
    account_number: string
    sequence: string
  }
}

type RestBlockResponse = {
  block: {
    header: {
      height: string
      time: string
    }
  }
}

/**
 * Chains where StargateClient cannot connect due to incompatible
 * validator pubkey types (e.g. MLDSA). Use REST API instead.
 */
const restOnlyChains: CosmosChain[] = [Chain.QBTC]

/** Fetches account info and latest block via Cosmos REST API. */
const getCosmosRestAccountInfo = async (
  chain: CosmosChain,
  address: string
) => {
  const baseUrl = cosmosRpcUrl[chain]

  const [accountResponse, blockResponse] = await Promise.all([
    queryUrl<RestAccountResponse>(
      `${baseUrl}/cosmos/auth/v1beta1/accounts/${address}`
    ),
    queryUrl<RestBlockResponse>(
      `${baseUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`
    ),
  ])

  const { account } = accountResponse
  const { header } = blockResponse.block

  const blockTimestampNs = BigInt(new Date(header.time).getTime()) * 1_000_000n
  const timeoutNs = blockTimestampNs + 600_000_000_000n // +10 minutes

  return {
    address,
    accountNumber: Number(account.account_number),
    sequence: Number(account.sequence),
    pubkey: null,
    latestBlock: `${header.height}_${timeoutNs}`,
  }
}

export const getCosmosAccountInfo = async ({
  chain,
  address,
}: ChainAccount<CosmosChain>) => {
  if (restOnlyChains.includes(chain)) {
    return getCosmosRestAccountInfo(chain, address)
  }

  const client = await getCosmosClient(chain)
  const accountInfo = shouldBePresent(await client.getAccount(address))
  const block = await client.getBlock()
  const blockTimestampStr = block.header.time
  const blockTimestampNs =
    BigInt(new Date(blockTimestampStr).getTime()) * 1_000_000n

  const timeoutNs = blockTimestampNs + 600_000_000_000n // +10 minutes
  const latestBlock = `${block.header.height}_${timeoutNs}`

  return {
    ...accountInfo,
    latestBlock,
  }
}
