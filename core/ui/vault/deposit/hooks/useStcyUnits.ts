import { Chain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { useCurrentVaultAddresses } from '../../state/currentVaultCoins'

type BankResp = { balances: { denom: string; amount: string }[] }

export const useStcyUnits = () => {
  const addresses = useCurrentVaultAddresses() || []
  const [, thorAddr] =
    Object.entries(addresses).find(([c]) => c === Chain.THORChain) || []
  return useQuery({
    queryKey: ['tcy', 'stcy', 'units', thorAddr],
    enabled: !!thorAddr,
    queryFn: async () => {
      const url = `${cosmosRpcUrl[Chain.THORChain]}/cosmos/bank/v1beta1/balances/${thorAddr}`
      const res = await queryUrl<BankResp>(url)
      const amt =
        res.balances.find(b => b.denom === 'x/staking-tcy')?.amount ?? '0'
      return BigInt(amt)
    },
    select: v => v,
  })
}
