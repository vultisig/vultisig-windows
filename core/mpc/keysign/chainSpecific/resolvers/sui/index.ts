import { create } from '@bufbuild/protobuf'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { suiGasBudget } from '@core/chain/chains/sui/config'
import {
  SuiCoinSchema,
  SuiSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { attempt, withFallback } from '@lib/utils/attempt'
import { type CoinStruct } from '@mysten/sui/jsonRpc'

import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../../resolver'
import { refineSuiChainSpecific } from './refine'

export const getSuiChainSpecific: GetChainSpecificResolver<
  'suicheSpecific'
> = async ({ keysignPayload, walletCore }) => {
  const coin = getKeysignCoin(keysignPayload)
  const { address } = coin
  const client = getSuiClient()

  const { data } = await client.getAllCoins({
    owner: address,
  })

  const coins = data.map((coin: CoinStruct) => create(SuiCoinSchema, coin))

  const referenceGasPrice = await client.getReferenceGasPrice()

  const chainSpecific = create(SuiSpecificSchema, {
    coins,
    referenceGasPrice: referenceGasPrice.toString(),
    gasBudget: suiGasBudget.toString(),
  })

  return withFallback(
    attempt(
      refineSuiChainSpecific({
        keysignPayload,
        chainSpecific,
        walletCore,
      })
    ),
    chainSpecific
  )
}
