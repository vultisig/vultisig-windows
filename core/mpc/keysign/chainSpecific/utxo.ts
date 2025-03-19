import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { UtxoChain } from '@core/chain/Chain'
import { getUtxoStats } from '@core/chain/chains/utxo/client/getUtxoStats'
import { getCoinBalance } from '@core/chain/coin/balance'
import { adjustByteFee } from '@core/chain/tx/fee/utxo/adjustByteFee'
import { UtxoFeeSettings } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import {
  UTXOSpecific,
  UTXOSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getUtxoSpecific: ChainSpecificResolver<
  UTXOSpecific,
  UtxoFeeSettings
> = async ({ coin, feeSettings, amount }) => {
  const chain = coin.chain as UtxoChain

  const { data } = await getUtxoStats(chain)

  let byteFee = data.suggested_transaction_fee_per_byte_sat
  if (feeSettings) {
    byteFee = adjustByteFee(byteFee, feeSettings)
  }

  const result = create(UTXOSpecificSchema, {
    byteFee: byteFee.toString(),
  })

  if (amount) {
    const balance = await getCoinBalance(coin)

    result.sendMaxAmount = toChainAmount(amount, coin.decimals) === balance
  }

  return result
}
