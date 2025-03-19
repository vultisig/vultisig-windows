import { create } from '@bufbuild/protobuf'
import { CosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { getThorNetworkInfo } from '@core/chain/chains/cosmos/thor/getThorNetworkInfo'
import {
  THORChainSpecific,
  THORChainSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getThorchainSpecific: ChainSpecificResolver<
  THORChainSpecific
> = async ({ coin, isDeposit = false }) => {
  const { accountNumber, sequence } = await getCosmosAccountInfo({
    address: coin.address,
    chain: coin.chain as CosmosChain,
  })

  const { native_tx_fee_rune } = await getThorNetworkInfo()

  return create(THORChainSpecificSchema, {
    accountNumber: BigInt(accountNumber),
    sequence: BigInt(sequence ?? 0),
    fee: BigInt(native_tx_fee_rune),
    isDeposit,
  })
}
