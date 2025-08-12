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

import { ChainSpecificResolver } from '../resolver'

const dustStats = 600n

const getByteFee = async (chain: UtxoChain) => {
  if (chain === UtxoChain.Zcash) {
    return 1000
  }

  const { data } = await getUtxoStats(chain)
  return data.suggested_transaction_fee_per_byte_sat
}

export const getUtxoSpecific: ChainSpecificResolver<
  UTXOSpecific,
  UtxoFeeSettings
> = async ({ coin, feeSettings, amount }) => {
  const chain = coin.chain as UtxoChain

  let byteFee = await getByteFee(chain)
  if (feeSettings) {
    byteFee = adjustByteFee(byteFee, feeSettings)
  }

  const result = create(UTXOSpecificSchema, {
    byteFee: byteFee.toString(),
  })

  if (amount) {
    const balance = await getCoinBalance(coin)
    const requested = toChainAmount(amount, coin.decimals)
    result.sendMaxAmount = balance - requested <= dustStats
  }

  return result
}
