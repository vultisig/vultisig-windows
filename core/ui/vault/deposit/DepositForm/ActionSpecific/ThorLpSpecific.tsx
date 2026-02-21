import { Chain } from '@core/chain/Chain'
import { getThorchainLpPool } from '@core/chain/chains/cosmos/thor/thorchainLp'
import { lpChainMap } from '@core/ui/storage/defiPositions'
import {
  useCurrentVaultAddress,
  useCurrentVaultAddresses,
} from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { Text } from '@lib/ui/text'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { midgardBaseUrl } from '../../../../defi/chain/queries/constants'
import { useDepositCoin } from '../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../providers/DepositFormHandlersProvider'
import { AssetRequiredLabel, Container } from '../DepositForm.styled'
import { ThorLpPoolExplorer } from './ThorLpPoolExplorer'

type MidgardPool = {
  asset: string
}

const useThorchainLpPoolsQuery = () =>
  useQuery({
    queryKey: ['thorchain', 'lp', 'availablePools'],
    queryFn: () =>
      queryUrl<MidgardPool[]>(`${midgardBaseUrl}/pools?status=available`, {
        headers: { 'X-Client-ID': 'vultisig' },
      }),
    ...noRefetchQueryOptions,
  })

export const ThorLpSpecific = () => {
  const [{ setValue, getValues }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const thorchainAddress = useCurrentVaultAddress(Chain.THORChain)
  const vaultAddresses = useCurrentVaultAddresses()
  const { t } = useTranslation()

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
    <Opener
      renderOpener={({ onOpen }) => (
        <Container onClick={onOpen}>
          <HStack alignItems="center" gap={4}>
            <Text weight="400" family="mono" size={16}>
              {selectedPool || t('select_pool')}
            </Text>
            {!selectedPool && (
              <AssetRequiredLabel as="span" color="danger" size={14}>
                *
              </AssetRequiredLabel>
            )}
          </HStack>
          <IconWrapper style={{ fontSize: 20 }}>
            <ChevronRightIcon />
          </IconWrapper>
        </Container>
      )}
      renderContent={({ onClose }) => (
        <ThorLpPoolExplorer
          pools={poolOptions}
          activePool={selectedPool}
          onPoolClick={pool => {
            setSelectedPool(pool)
            onClose()
          }}
          onClose={onClose}
        />
      )}
    />
  )
}
