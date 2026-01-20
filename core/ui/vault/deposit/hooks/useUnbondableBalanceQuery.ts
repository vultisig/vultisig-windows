import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import {
  midgardBaseUrl,
  thornodeBaseUrl,
} from '@core/ui/defi/chain/queries/constants'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

// Set to true to use mock data for testing when you don't have bonded RUNE
const useMockData = false
const mockUnbondableBalance = 500

type BondProvider = {
  bond_address?: string
  bond?: string
}

type BondedNodesResponse = {
  nodes?: Array<{
    status?: string
    address: string
    bond?: string
  }>
}

type NodeDetailsResponse = {
  bond_providers?: {
    providers?: BondProvider[]
  }
}

const getBondedNodes = (address: string) =>
  queryUrl<BondedNodesResponse>(`${midgardBaseUrl}/bonds/${address}`)

const getNodeDetails = (nodeAddress: string) =>
  queryUrl<NodeDetailsResponse>(`${thornodeBaseUrl}/node/${nodeAddress}`)

type UseUnbondableBalanceQueryOptions = {
  enabled?: boolean
}

export const useUnbondableBalanceQuery = (
  options: UseUnbondableBalanceQueryOptions = {}
) => {
  const { enabled = true } = options
  const address = useCurrentVaultAddress(Chain.THORChain)
  const [{ form: formDefaults }] = useCoreViewState<'deposit'>()

  const nodeAddressFromNav = formDefaults?.nodeAddress as string | undefined
  const bondedAmountFromNav = formDefaults?.bondedAmount as string | undefined

  return useQuery({
    queryKey: [
      'unbondable-balance',
      address,
      nodeAddressFromNav,
      bondedAmountFromNav,
    ],
    enabled: enabled && Boolean(address),
    queryFn: async () => {
      // Mock data for testing
      if (useMockData) {
        const mockAmount = toChainAmount(
          mockUnbondableBalance,
          chainFeeCoin[Chain.THORChain].decimals
        )
        return {
          totalBonded: mockAmount,
          humanReadableBalance: mockUnbondableBalance,
        }
      }

      // Use bonded amount from navigation if available (passed from DeFi page)
      if (bondedAmountFromNav) {
        const amount = BigInt(bondedAmountFromNav)
        return {
          totalBonded: amount,
          humanReadableBalance: fromChainAmount(
            amount,
            chainFeeCoin[Chain.THORChain].decimals
          ),
        }
      }

      // Fetch from API
      const bondedNodes = await getBondedNodes(address)
      const nodes = bondedNodes?.nodes ?? []

      if (nodes.length === 0) {
        return {
          totalBonded: 0n,
          humanReadableBalance: 0,
        }
      }

      let totalBonded = 0n

      if (nodeAddressFromNav) {
        const nodeDetails = await getNodeDetails(nodeAddressFromNav)
        const providers = nodeDetails?.bond_providers?.providers ?? []
        const myBond = providers
          .filter(p => p.bond_address?.toLowerCase() === address.toLowerCase())
          .reduce((acc, provider) => acc + BigInt(provider.bond ?? '0'), 0n)
        totalBonded = myBond
      } else {
        // Use Promise.all to fetch all node details in parallel
        const nodeDetailsPromises = nodes.map(node =>
          getNodeDetails(node.address)
        )
        const nodeDetailsArray = await Promise.all(nodeDetailsPromises)

        for (const nodeDetails of nodeDetailsArray) {
          const providers = nodeDetails?.bond_providers?.providers ?? []
          const myBond = providers
            .filter(
              p => p.bond_address?.toLowerCase() === address.toLowerCase()
            )
            .reduce((acc, provider) => acc + BigInt(provider.bond ?? '0'), 0n)
          totalBonded += myBond
        }
      }

      return {
        totalBonded,
        humanReadableBalance: fromChainAmount(
          totalBonded,
          chainFeeCoin[Chain.THORChain].decimals
        ),
      }
    },
  })
}
