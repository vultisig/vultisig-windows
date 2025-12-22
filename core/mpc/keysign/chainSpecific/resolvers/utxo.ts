import { create } from '@bufbuild/protobuf'
import { UtxoChain } from '@core/chain/Chain'
import { getUtxoByteFee } from '@core/chain/chains/utxo/fee/byteFee'
import {
  byteFeeMultiplier,
  UtxoFeeSettings,
} from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { UTXOSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getUtxoChainSpecific: GetChainSpecificResolver<
  'utxoSpecific'
> = async ({ keysignPayload, feeSettings }) => {
  const coin = getKeysignCoin<UtxoChain>(keysignPayload)

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

  return create(UTXOSpecificSchema, {
    sendMaxAmount: false,
    byteFee: (await getByteFee()).toString(),
  })
}
