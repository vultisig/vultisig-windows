import { rootApiUrl } from '@core/config'

const circleApiUrl = `${rootApiUrl}/circle`

export type CircleAccountQueryKeyInput = {
  ownerAddress: string
}

export const getCircleAccountQueryKey = ({
  ownerAddress,
}: CircleAccountQueryKeyInput) =>
  ['getCircleAccount', { ownerAddress }] as const

export const getCircleWalletsUrl = ({
  ownerAddress,
}: CircleAccountQueryKeyInput) => {
  const url = new URL(`${circleApiUrl}/wallet`)
  url.searchParams.set('refId', ownerAddress)

  return url.toString()
}

export const getCreateCircleWalletUrl = () => `${circleApiUrl}/create`
