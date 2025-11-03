import { create } from '@bufbuild/protobuf'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { suiGasBudget } from '@core/chain/chains/sui/config'
import {
  SuiCoinSchema,
  SuiSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getSuiChainSpecific: GetChainSpecificResolver<
  'suicheSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin(keysignPayload)
  const { address } = coin
  const client = getSuiClient()

  const { data } = await client.getAllCoins({
    owner: address,
  })

  const coins = data
    .filter(f => f.coinType == '0x2::sui::SUI')
    .map(coin => create(SuiCoinSchema, coin))

  const referenceGasPrice = await client.getReferenceGasPrice()

  return create(SuiSpecificSchema, {
    coins,
    referenceGasPrice: referenceGasPrice.toString(),
    gasBudget: suiGasBudget.toString(),
  })
}
