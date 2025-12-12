import { productName } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { circleApiUrl } from './config'

type CreateCircleWalletBody = {
  idempotency_key: string
  account_type: 'SCA'
  owner: string
  name: string
}

const defaultVaultName = `${productName} Vault`

export const openCircleAccount = (ownerAddress: string) => {
  const body: CreateCircleWalletBody = {
    idempotency_key: crypto.randomUUID(),
    account_type: 'SCA',
    owner: ownerAddress,
    name: defaultVaultName,
  }

  return queryUrl(`${circleApiUrl}/create`, {
    body,
  })
}
