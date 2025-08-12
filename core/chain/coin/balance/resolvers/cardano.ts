import { OtherChain } from '@core/chain/Chain'
import { cardanoApiUrl } from '@core/chain/chains/cardano/client/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { CoinBalanceResolver } from '../resolver'

type CardanoAddressInfoResponse = Array<{
  balance: string
}>

export const getCardanoCoinBalance: CoinBalanceResolver<
  OtherChain.Cardano
> = async input => {
  const url = `${cardanoApiUrl}/address_info`

  const [{ balance } = { balance: '0' }] =
    await queryUrl<CardanoAddressInfoResponse>(url, {
      body: {
        _addresses: [input.address],
      },
    })

  return BigInt(balance)
}
