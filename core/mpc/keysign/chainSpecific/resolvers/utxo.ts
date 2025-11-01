import { create } from '@bufbuild/protobuf'
import { UtxoChain } from '@core/chain/Chain'
import { getUtxoByteFee } from '@core/chain/chains/utxo/fee/byteFee'
import {
  byteFeeMultiplier,
  complexUtxoTxMultiplier,
} from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { UTXOSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'
import { bigIntSum } from '@lib/utils/bigint/bigIntSum'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

const dustStats = 600n

export const getUtxoChainSpecific: GetChainSpecificResolver<
  'utxoSpecific'
> = async ({ keysignPayload, feeSettings }) => {
  const coin = getKeysignCoin<UtxoChain>(keysignPayload)
  const amount = keysignPayload.toAmount
    ? BigInt(keysignPayload.toAmount)
    : undefined

  const utxoInfo = keysignPayload.utxoInfo || []

  let byteFee: bigint

  if (feeSettings) {
    const baseByteFee = await getUtxoByteFee(coin.chain)
    const isComplexTx = !!keysignPayload.memo
    const adjustedByteFee = isComplexTx
      ? multiplyBigInt(baseByteFee, complexUtxoTxMultiplier)
      : baseByteFee

    byteFee = matchRecordUnion(feeSettings, {
      byteFee: byteFee => byteFee,
      priority: priority =>
        multiplyBigInt(adjustedByteFee, byteFeeMultiplier[priority]),
    })
  } else {
    const baseByteFee = await getUtxoByteFee(coin.chain)
    const isComplexTx = !!keysignPayload.memo
    byteFee = isComplexTx
      ? multiplyBigInt(baseByteFee, complexUtxoTxMultiplier)
      : baseByteFee
  }

  const balance = bigIntSum(utxoInfo.map(({ amount }) => amount))
  const sendMaxAmount = amount ? balance - amount <= dustStats : false

  return create(UTXOSpecificSchema, {
    psbt: undefined,
    sendMaxAmount,
    byteFee: byteFee.toString(),
  })
}
