import { OtherChain } from '@core/chain/Chain'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { CoinBalanceResolver } from './CoinBalanceResolver'

const cardanoApiBaseUrl = 'https://api.koios.rest/api/v1'

type CardanoAddressInfoResponse = Array<{
  balance: string
}>

export const getCardanoCoinBalance: CoinBalanceResolver<
  OtherChain.Cardano
> = async input => {
  const url = `${cardanoApiBaseUrl}/address_info`

  const requestBody = {
    _addresses: [input.address],
  }

  const [{ balance }] = await queryUrl<CardanoAddressInfoResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  return BigInt(balance)
}
