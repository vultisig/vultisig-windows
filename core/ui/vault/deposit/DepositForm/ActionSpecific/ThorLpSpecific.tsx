import { lpChainMap } from '@core/ui/storage/defiPositions'
import {
  useCurrentVaultAddress,
  useCurrentVaultAddresses,
} from '@core/ui/vault/state/currentVaultCoins'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getThorchainLpPool } from '@vultisig/core-chain/chains/cosmos/thor/thorchainLp'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { useEffect, useState } from 'react'

import { midgardBaseUrl } from '../../../../defi/chain/queries/constants'
import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../providers/DepositFormHandlersProvider'
import { LpPoolSelector } from './LpPoolSelector'

type MidgardPool = {
  asset: string
}

const useThorchainLpPoolsQuery = () =>
  useQuery({
    queryKey: ['thorchain', 'lp', 'availablePools'],
    queryFn: () =>
      queryUrl<MidgardPool[]>(`${midgardBaseUrl}/pools?status=available`),
    ...noRefetchQueryOptions,
  })

export const ThorLpSpecific = () => {
  const [{ setValue, getValues }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const thorchainAddress = useCurrentVaultAddress(Chain.THORChain)
  const vaultAddresses = useCurrentVaultAddresses()

  const isRuneSide = coin.chain === Chain.THORChain
  const poolsQuery = useThorchainLpPoolsQuery()

  const initialPool = (getValues('pool') as string) || null
  const [selectedPool, setSelectedPool] = useState<string | null>(initialPool)

  useEffect(() => {
    if (isRuneSide) return

    const pool = getThorchainLpPool({
      chain: coin.chain,
      ticker: coin.ticker,
      id: coin.id,
    })
    setValue('pool', pool, { shouldValidate: true })
    setValue('pairedAddress', thorchainAddress, { shouldValidate: true })
  }, [coin.chain, coin.id, coin.ticker, isRuneSide, setValue, thorchainAddress])

  useEffect(() => {
    if (!isRuneSide || !selectedPool) return

    const [chainCode] = selectedPool.split('.')
    const assetChain = chainCode
      ? lpChainMap[chainCode.toUpperCase()]
      : undefined
    const pairedAddress = assetChain ? vaultAddresses[assetChain] : undefined

    setValue('pool', selectedPool, { shouldValidate: true })
    setValue('pairedAddress', pairedAddress ?? '', { shouldValidate: true })
  }, [isRuneSide, selectedPool, setValue, vaultAddresses])

  if (!isRuneSide) return null

  const poolOptions = (poolsQuery.data ?? []).map(p => p.asset)

  return (
    <LpPoolSelector
      value={selectedPool}
      onChange={setSelectedPool}
      pools={poolOptions}
    />
  )
}
