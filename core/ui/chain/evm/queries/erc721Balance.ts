import { EvmChain } from '@core/chain/Chain'
import { getErc721Balance } from '@core/chain/chains/evm/erc721/getErc721Balance'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

type Input = {
  chain: EvmChain
  address: Address
  accountAddress: Address
}

export const useErc721BalanceQuery = ({
  chain,
  address,
  accountAddress,
}: Input) => {
  return useQuery({
    queryKey: ['erc721Balance', chain, address, accountAddress],
    queryFn: () =>
      getErc721Balance({
        chain,
        address,
        accountAddress,
      }),
    enabled: !!accountAddress,
  })
}
