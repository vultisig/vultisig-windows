import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import {
  CosmosSpecific,
  CosmosSpecificSchema,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainsBySpecific } from '../KeysignChainSpecific'
import { ChainSpecificResolver } from '../resolver'

type CosmosSpecificChain = ChainsBySpecific<'cosmosSpecific'>

const defaultGas = 7500

const defaultGasRecord: Record<CosmosSpecificChain, number> = {
  [Chain.Cosmos]: defaultGas,
  [Chain.Osmosis]: defaultGas,
  [Chain.Kujira]: defaultGas,
  [Chain.Terra]: defaultGas,
  [Chain.Dydx]: 2500000000000000,
  [Chain.TerraClassic]: 100000000,
  [Chain.Noble]: 30000,
  [Chain.Akash]: 200000,
}

export const getCosmosSpecific: ChainSpecificResolver<CosmosSpecific> = async ({
  coin,
  transactionType = TransactionType.UNSPECIFIED,
  timeoutTimestamp,
}) => {
  const chain = coin.chain as CosmosSpecificChain
  const { accountNumber, sequence, latestBlock } = await getCosmosAccountInfo({
    address: coin.address,
    chain,
  })

  const gas = BigInt(defaultGasRecord[chain])

  // latestBlock carries "height_timeoutNs". If a Cosmos timeout timestamp is provided,
  // honor it by replacing the suffix while keeping the height prefix.
  const latestBlockStr = latestBlock.toString()
  const latestBlockWithTimeout = timeoutTimestamp
    ? `${latestBlockStr.split('_')[0]}_${timeoutTimestamp}`
    : latestBlockStr

  return create(CosmosSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence),
    gas,
    transactionType,
    ibcDenomTraces: {
      latestBlock: latestBlockWithTimeout,
      baseDenom: '',
      path: '',
    },
  })
}
