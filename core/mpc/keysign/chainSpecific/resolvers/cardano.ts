import { create } from '@bufbuild/protobuf'
import { getCardanoCurrentSlot } from '@core/chain/chains/cardano/client/currentSlot'
import { cardanoDefaultFee } from '@core/chain/chains/cardano/config'
import { cardanoSlotOffset } from '@core/chain/chains/cardano/config'
import { CardanoChainSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { bigIntSum } from '@lib/utils/bigint/bigIntSum'

import { getKeysignAmount } from '../../utils/getKeysignAmount'
import { GetChainSpecificResolver } from '../resolver'

export const getCardanoChainSpecific: GetChainSpecificResolver<
  'cardano'
> = async ({ keysignPayload }) => {
  const amount = getKeysignAmount(keysignPayload)

  const currentSlot = await getCardanoCurrentSlot()
  const ttl = currentSlot + BigInt(cardanoSlotOffset)

  const utxoInfo = keysignPayload.utxoInfo
  const balance = bigIntSum(utxoInfo.map(({ amount }) => amount))
  const sendMaxAmount = amount ? balance === amount : false

  return create(CardanoChainSpecificSchema, {
    ttl,
    sendMaxAmount,
    byteFee: BigInt(cardanoDefaultFee),
  })
}
