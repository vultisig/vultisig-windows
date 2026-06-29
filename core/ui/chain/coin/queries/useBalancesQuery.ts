import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { useQueries } from '@tanstack/react-query'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { getCoinBalance } from '@vultisig/core-chain/coin/balance'
import { getEvmChainBalances } from '@vultisig/core-chain/coin/balance/getEvmChainBalances'
import { CoinBalanceResolverInput } from '@vultisig/core-chain/coin/balance/resolver'
import { mergeRecords } from '@vultisig/lib-utils/record/mergeRecords'
import { Exact } from '@vultisig/lib-utils/types/Exact'
import { Address } from 'viem'

type EvmBalanceRequest = {
  input: CoinBalanceResolverInput<EvmChain>
  resolve: (amount: bigint) => void
  reject: (error: unknown) => void
}

const evmBalanceRequests = new Map<string, EvmBalanceRequest[]>()

const getEvmBalanceBatchKey = ({
  chain,
  address,
}: CoinBalanceResolverInput<EvmChain>) =>
  `${chain}:${address.toLocaleLowerCase()}`

const getNormalizedBalanceKey = (input: CoinBalanceResolverInput) =>
  accountCoinKeyToString({
    ...input,
    address: input.address.toLocaleLowerCase(),
  }).toLocaleLowerCase()

const resolveEvmBalanceBatch = async (requests: EvmBalanceRequest[]) => {
  const [firstRequest] = requests

  if (!firstRequest) return

  const balances = await getEvmChainBalances({
    chain: firstRequest.input.chain,
    address: firstRequest.input.address as Address,
    coins: requests.map(({ input }) => input),
  })
  const normalizedBalances = Object.fromEntries(
    Object.entries(balances).map(([key, value]) => [
      key.toLocaleLowerCase(),
      value,
    ])
  )

  requests.forEach(({ input, resolve }) => {
    resolve(normalizedBalances[getNormalizedBalanceKey(input)] ?? 0n)
  })
}

const getBatchedEvmCoinBalance = (input: CoinBalanceResolverInput<EvmChain>) =>
  new Promise<bigint>((resolve, reject) => {
    const batchKey = getEvmBalanceBatchKey(input)
    const existingRequests = evmBalanceRequests.get(batchKey)

    evmBalanceRequests.set(batchKey, [
      ...(existingRequests ?? []),
      { input, resolve, reject },
    ])

    if (existingRequests) return

    queueMicrotask(() => {
      const requests = evmBalanceRequests.get(batchKey)
      evmBalanceRequests.delete(batchKey)

      if (!requests) return

      resolveEvmBalanceBatch(requests).catch(error => {
        requests.forEach(({ reject }) => reject(error))
      })
    })
  })

export const getCoinBalanceQueryAmount = (input: CoinBalanceResolverInput) => {
  if (isChainOfKind(input.chain, 'evm')) {
    return getBatchedEvmCoinBalance(input as CoinBalanceResolverInput<EvmChain>)
  }

  return getCoinBalance(input)
}

export function getBalanceQueryKey<T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
): [string, CoinBalanceResolverInput] {
  return ['coinBalance', input]
}

export const getBalanceQueryOptions = <T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
) => ({
  queryKey: getBalanceQueryKey(input),
  queryFn: async () => {
    const amount = await getCoinBalanceQueryAmount(input)
    return {
      [accountCoinKeyToString(input)]: amount,
    }
  },
  ...persistQueryOptions,
})

export const useBalancesQuery = <T extends CoinBalanceResolverInput>(
  inputs: Exact<CoinBalanceResolverInput, T>[]
) => {
  const queries = useQueries({
    queries: inputs.map(input => getBalanceQueryOptions(input)),
  })

  return useCombineQueries({
    queries,
    joinData: data => mergeRecords(...data),
  })
}
