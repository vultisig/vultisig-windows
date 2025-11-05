import { create } from '@bufbuild/protobuf'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { suiGasBudget } from '@core/chain/chains/sui/config'
import {
  SuiCoinSchema,
  SuiSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'

import { getKeysignAmount } from '../../../utils/getKeysignAmount'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../../resolver'
import { getSuiGasBudget } from './gasBudget'

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

  const gasBudget = await withFallback(
    attempt(
      getSuiGasBudget({
        sender: address,
        recipient: keysignPayload.toAddress,
        amount: shouldBePresent(getKeysignAmount(keysignPayload)),
        gasPrice: referenceGasPrice,
      })
    ),
    suiGasBudget
  )

  return create(SuiSpecificSchema, {
    coins,
    referenceGasPrice: referenceGasPrice.toString(),
    gasBudget: gasBudget.toString(),
  })
}
