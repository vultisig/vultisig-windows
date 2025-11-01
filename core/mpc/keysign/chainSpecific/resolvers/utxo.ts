import { create } from '@bufbuild/protobuf'
import { UtxoChain } from '@core/chain/Chain'
import { getUtxoByteFee } from '@core/chain/chains/utxo/fee/byteFee'
import {
  byteFeeMultiplier,
  UtxoFeeSettings,
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

  const getByteFee = () => {
    if (feeSettings) {
      return matchRecordUnion<UtxoFeeSettings, Promise<bigint>>(feeSettings, {
        byteFee: async value => value,
        priority: async priority =>
          multiplyBigInt(
            await getUtxoByteFee(coin.chain),
            byteFeeMultiplier[priority]
          ),
      })
    }

    return getUtxoByteFee(coin.chain)
  }

  const balance = bigIntSum(utxoInfo.map(({ amount }) => amount))
  const sendMaxAmount = amount ? balance - amount <= dustStats : false

  return create(UTXOSpecificSchema, {
    psbt: undefined,
    sendMaxAmount,
    byteFee: (await getByteFee()).toString(),
  })
}
