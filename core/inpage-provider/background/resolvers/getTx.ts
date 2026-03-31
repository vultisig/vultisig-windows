import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  ChainKindRecordUnion,
  toChainKindRecordUnion,
} from '@vultisig/core-chain/ChainKind'
import { getCosmosClient } from '@vultisig/core-chain/chains/cosmos/client'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'
import { getBlockchairBaseUrl } from '@vultisig/core-chain/chains/utxo/client/getBlockchairBaseUrl'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { toCamelCase } from '@vultisig/lib-utils/toCamelCase'

// This resolver replicates the old implementation of the get_transaction_by_hash request.
// TODO: Double-check whether this request is still in use and consider removing it.
export const getTx: BackgroundResolver<'getTx'> = async ({
  input: { chain, hash },
}) => {
  const result = await matchRecordUnion<ChainKindRecordUnion, unknown>(
    toChainKindRecordUnion(chain),
    {
      evm: async chain => {
        const client = getEvmClient(chain)

        return client.request({
          method: 'eth_getTransactionByHash',
          params: [hash as `0x${string}`],
        })
      },
      cosmos: async chain => {
        if (chain === Chain.THORChain) {
          return queryUrl(`${cosmosRpcUrl[chain]}/thorchain/tx/${hash}`)
        }

        const client = await getCosmosClient(chain)

        return client.getTx(hash)
      },
      qbtc: () => {
        throw new NotImplementedError('Get tx for QBTC chain')
      },
      utxo: async chain => {
        const url = `${getBlockchairBaseUrl(chain)}/dashboards/transaction/${hash}`

        const { data } = await queryUrl<{ data: Record<string, unknown> }>(url)

        return data[hash]
      },
      solana: () => {
        throw new NotImplementedError('Get tx for Solana chain')
      },
      polkadot: () => {
        throw new NotImplementedError('Get tx for Polkadot chain')
      },
      bittensor: () => {
        throw new NotImplementedError('Get tx for Bittensor chain')
      },
      ton: () => {
        throw new NotImplementedError('Get tx for TON chain')
      },
      ripple: () => {
        throw new NotImplementedError('Get tx for Ripple chain')
      },
      tron: () => {
        throw new NotImplementedError('Get tx for Tron chain')
      },
      cardano: () => {
        throw new NotImplementedError('Get tx for Cardano chain')
      },
      sui: () => {
        throw new NotImplementedError('Get tx for Sui chain')
      },
      qbtc: () => {
        throw new NotImplementedError('Get tx for QBTC chain')
      },
    }
  )

  return toCamelCase(
    JSON.parse(
      JSON.stringify(result, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    )
  )
}
