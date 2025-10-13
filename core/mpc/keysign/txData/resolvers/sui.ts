import { create } from '@bufbuild/protobuf'
import { getSuiClient } from '@core/chain/chains/sui/client'

import { SuiCoinSchema } from '../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignTxDataResolver } from '../resolver'

export const getSuiTxData: KeysignTxDataResolver = async ({
  coin: { address },
}) => {
  const client = getSuiClient()

  const { data } = await client.getAllCoins({
    owner: address,
  })

  const coins = data
    .filter(f => f.coinType == '0x2::sui::SUI')
    .map(coin => create(SuiCoinSchema, coin))

  return {
    coins,
  }
}
