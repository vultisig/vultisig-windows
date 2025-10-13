import { create } from '@bufbuild/protobuf'
import { getUtxoByteFee } from '@core/chain/chains/utxo/fee/byteFee'
import { getCoinBalance } from '@core/chain/coin/balance'
import { complexUtxoTxMultiplier } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import {
  UTXOSpecific,
  UTXOSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'

import { ChainSpecificResolver } from '../resolver'

const dustStats = 600n

export const getUtxoSpecific: ChainSpecificResolver<UTXOSpecific> = async ({
  coin,
  isComplexTx,
  amount,
  psbt,
}) => {
  const byteFee = await getUtxoByteFee(coin.chain)

  const adjustedByteFee = isComplexTx
    ? multiplyBigInt(byteFee, complexUtxoTxMultiplier)
    : byteFee

  const result = create(UTXOSpecificSchema, {
    byteFee: adjustedByteFee.toString(),

    psbt: psbt?.toBase64(),
  })

  if (amount) {
    const balance = await getCoinBalance(coin)
    result.sendMaxAmount = balance - amount <= dustStats
  }

  return result
}
