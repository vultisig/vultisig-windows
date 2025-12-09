import { Chain } from '@core/chain/Chain'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import {
  CircleAccountQueryKeyInput,
  getCircleAccountQueryKey,
  getCircleWalletsUrl,
} from '../api'

type CircleWallet = {
  address: string
  accountType: string
  state: string
}

const isCircleAccount = (wallet: CircleWallet) =>
  wallet.accountType === 'SCA' && wallet.state === 'LIVE'

const getCircleAccountQueryOptions = ({
  ownerAddress,
}: CircleAccountQueryKeyInput) => ({
  queryKey: getCircleAccountQueryKey({ ownerAddress }),
  queryFn: async () => {
    const wallets = await queryUrl<CircleWallet[]>(
      getCircleWalletsUrl({ ownerAddress })
    )

    const [wallet] = wallets.filter(isCircleAccount)

    if (!wallet) return null

    return shouldBePresent(wallet.address, 'circle wallet address')
  },
})

export const useCircleAccountQuery = () => {
  const ownerAddress = useCurrentVaultAddress(Chain.Ethereum)

  return useQuery(getCircleAccountQueryOptions({ ownerAddress }))
}
