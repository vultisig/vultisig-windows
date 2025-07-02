import { OtherChain } from '@core/chain/Chain'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { cardanoApiUrl } from '../../chains/cardano/client/config'
import { CoinBalanceResolver } from './CoinBalanceResolver'

type CardanoAddressInfoResponse = Array<{
  balance: string
}>

export const getCardanoCoinBalance: CoinBalanceResolver<
  OtherChain.Cardano
> = async input => {
  const url = `${cardanoApiUrl}/address_info`

  const requestBody = {
    _addresses: [input.address],
  }

  const [{ balance } = { balance: '0' }] =
    await queryUrl<CardanoAddressInfoResponse>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

  return BigInt(balance)
}
