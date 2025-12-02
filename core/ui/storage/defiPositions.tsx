import { Chain } from '@core/chain/Chain'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type DefiPositionType = 'bond' | 'stake' | 'lp'

export type DefiPosition = {
  id: string
  name: string
  ticker: string
  type: DefiPositionType
  chain: Chain
}

// Define available positions for each chain
const availableDefiPositions: Partial<Record<Chain, DefiPosition[]>> = {
  [Chain.THORChain]: [
    {
      id: 'thor-bond-rune',
      name: 'RUNE',
      ticker: 'RUNE',
      type: 'bond',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-tcy',
      name: 'TCY',
      ticker: 'TCY',
      type: 'stake',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-ruji',
      name: 'RUJI',
      ticker: 'RUJI',
      type: 'stake',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-sruji',
      name: 'sRUJI',
      ticker: 'sRUJI',
      type: 'stake',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-lp-rune-eth',
      name: 'RUNE/ETH',
      ticker: 'RUNE/ETH',
      type: 'lp',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-lp-rune-usdc',
      name: 'RUNE/USDC',
      ticker: 'RUNE/USDC',
      type: 'lp',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-lp-rune-btc',
      name: 'RUNE/BTC',
      ticker: 'RUNE/BTC',
      type: 'lp',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-lp-rune-bnb',
      name: 'RUNE/BNB',
      ticker: 'RUNE/BNB',
      type: 'lp',
      chain: Chain.THORChain,
    },
  ],
  [Chain.MayaChain]: [
    {
      id: 'maya-bond-cacao',
      name: 'CACAO',
      ticker: 'CACAO',
      type: 'bond',
      chain: Chain.MayaChain,
    },
    {
      id: 'maya-stake-maya',
      name: 'MAYA',
      ticker: 'MAYA',
      type: 'stake',
      chain: Chain.MayaChain,
    },
  ],
}

// Get positions for a specific chain
export const getAvailablePositionsForChain = (chain: Chain): DefiPosition[] => {
  return availableDefiPositions[chain] || []
}

// Get positions by type for a specific chain
type GetPositionsByTypeInput = {
  chain: Chain
  type: DefiPositionType
}

export const getPositionsByType = ({
  chain,
  type,
}: GetPositionsByTypeInput): DefiPosition[] => {
  const positions = availableDefiPositions[chain] || []
  return positions.filter(p => p.type === type)
}

type DefiPositionsRecord = Record<string, string[]> // chain -> position ids

type GetDefiPositionsFunction = () => Promise<DefiPositionsRecord>
type SetDefiPositionsFunction = (
  positions: DefiPositionsRecord
) => Promise<void>

export type DefiPositionsStorage = {
  getDefiPositions: GetDefiPositionsFunction
  setDefiPositions: SetDefiPositionsFunction
}

const useDefiPositionsQuery = () => {
  const { getDefiPositions } = useCore()

  return useQuery({
    queryKey: [StorageKey.defiPositions],
    queryFn: getDefiPositions,
    ...noRefetchQueryOptions,
  })
}

export const useDefiPositions = (chain: Chain): string[] => {
  const { data } = useDefiPositionsQuery()

  return data?.[chain] ?? []
}

const useAllDefiPositions = (): DefiPositionsRecord => {
  const { data } = useDefiPositionsQuery()

  return data ?? {}
}

const useSetDefiPositionsMutation = () => {
  const { setDefiPositions } = useCore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setDefiPositions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [StorageKey.defiPositions] })
    },
  })
}

export const useToggleDefiPosition = (chain: Chain) => {
  const allPositions = useAllDefiPositions()
  const chainPositions = allPositions[chain] ?? []
  const { mutate: setDefiPositions, isPending } = useSetDefiPositionsMutation()

  const togglePosition = (positionId: string) => {
    const isSelected = chainPositions.includes(positionId)

    const newChainPositions = isSelected
      ? chainPositions.filter(id => id !== positionId)
      : [...chainPositions, positionId]

    setDefiPositions({
      ...allPositions,
      [chain]: newChainPositions,
    })
  }

  return { togglePosition, isPending }
}
