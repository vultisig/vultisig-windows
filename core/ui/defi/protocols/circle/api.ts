import { productName, rootApiUrl } from '@core/config'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { queryUrl } from '@lib/utils/query/queryUrl'

const circleApiUrl = `${rootApiUrl}/circle`

type CreateCircleWalletBody = {
  idempotency_key: string
  account_type: 'SCA'
  owner: string
  name: string
}

export const getCircleWalletsUrl = (ownerAddress: string) => {
  const url = new URL(`${circleApiUrl}/wallet`)
  url.searchParams.set('refId', ownerAddress)

  return url.toString()
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

type CircleWallet = {
  address: string
  accountType: string
  state: string
}

const isCircleAccount = (wallet: CircleWallet) =>
  wallet.accountType === 'SCA' && wallet.state === 'LIVE'

export type GetCircleAccountInput = {
  ownerAddress: string
}

export const getCircleAccount = async ({
  ownerAddress,
}: GetCircleAccountInput) => {
  const wallets = await queryUrl<CircleWallet[]>(
    getCircleWalletsUrl(ownerAddress)
  )

  const [wallet] = wallets.filter(isCircleAccount)

  if (!wallet) return null

  return shouldBePresent(wallet.address, 'circle wallet address')
}
