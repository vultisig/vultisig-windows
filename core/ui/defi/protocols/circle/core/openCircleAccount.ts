import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { currentProductBrandConfig } from '../../../../product/brand'
import { circleApiUrl } from './config'

type CreateCircleWalletBody = {
  idempotency_key: string
  account_type: 'SCA'
  owner: string
  name: string
}

const defaultVaultName = `${currentProductBrandConfig.name} Vault`

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
