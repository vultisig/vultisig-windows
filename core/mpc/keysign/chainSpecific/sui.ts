import { create } from '@bufbuild/protobuf'
import { getSuiClient } from '@core/chain/chains/sui/client'
import {
  SuiCoinSchema,
  SuiSpecific,
  SuiSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getSuiSpecific: ChainSpecificResolver<SuiSpecific> = async ({
  coin,
}) => {
  const client = getSuiClient()

  const gasPrice = await client.getReferenceGasPrice()

  const allCoins = await client.getAllCoins({
    owner: coin.address,
  })

  const coins = allCoins.data
    .filter(f => f.coinType == '0x2::sui::SUI')
    .map(coin => {
      return create(SuiCoinSchema, coin)
    })

  return create(SuiSpecificSchema, {
    referenceGasPrice: gasPrice.toString(),
    coins,
  })
}
