import { create } from '@bufbuild/protobuf'
import { OtherChain } from '@core/chain/Chain'
import { getTonAccountInfo } from '@core/chain/chains/ton/account/getTonAccountInfo'
import { TonSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getTonChainSpecific: GetChainSpecificResolver<
  'tonSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin<OtherChain.Ton>(keysignPayload)
  const { account_state } = await getTonAccountInfo(coin.address)
  const sequenceNumber = BigInt(account_state.seqno || 0)

  return create(TonSpecificSchema, {
    sequenceNumber,
    expireAt: BigInt(Math.floor(Date.now() / 1000) + 600),
    bounceable: false,
  })
}
