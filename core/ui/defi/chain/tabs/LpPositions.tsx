import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { shouldDisplayChainLogo } from '@core/ui/chain/coin/icon/utils/shouldDisplayChainLogo'
import { WithChainIcon } from '@core/ui/chain/coin/icon/WithChainIcon'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  DefiPosition,
  isDefiPositionSelected,
  lpChainMap,
  useAvailableDefiPositions,
  useDefiPositions,
} from '@core/ui/storage/defiPositions'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CircleMinusIcon } from '@lib/ui/icons/CircleMinusIcon'
import { CirclePlusIcon } from '@lib/ui/icons/CirclePlusIcon'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { resolveDefiPositionIcon } from '../config/defiPositionResolver'
import { useMayaLpPositionsQuery } from '../queries/useMayaLpPositionsQuery'
import { useThorchainLpPositionsQuery } from '../queries/useThorchainLpPositionsQuery'
import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'
import { DefiPositionErrorState } from './DefiPositionErrorState'

const Card = styled(Panel)`
  padding: 20px;
  ${borderRadius.xl};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`

const SectionRow = styled(HStack)`
  width: 100%;
  align-items: center;
  gap: 12px;
`

const StatRow = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const StatLabel = styled(HStack)`
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${getColor('textShy')};
`

const StatValue = styled(Text)`
  font-size: 16px;
  font-weight: 600;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${getColor('foregroundSuper')};
`

const ActionsRow = styled(HStack)`
  width: 100%;
  gap: 12px;
  flex-wrap: wrap;
  align-items: stretch;

  & > * {
    flex: 1;
    min-width: 0;
    display: flex;
  }
`

const formatCryptoAmount = (value: number, decimals = 4) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })

const getBaseTicker = (chain: Chain) =>
  chain === Chain.MayaChain ? 'CACAO' : 'RUNE'

const getPairTicker = (position: DefiPosition) => {
  const [, asset] = position.name.split('/')
  return asset ?? position.ticker
}

const getAssetChainFromPool = (poolAsset: string): Chain | undefined => {
  const [chainCode] = poolAsset.split('.')
  if (!chainCode) return undefined
  return lpChainMap[chainCode.toUpperCase()]
}

type LpActionConfig = {
  addAction: ChainAction
  removeAction: ChainAction
}

const lpActionsByChain: Record<string, LpActionConfig> = {
  [Chain.THORChain]: {
    addAction: 'add_thor_lp',
    removeAction: 'remove_thor_lp',
  },
  [Chain.MayaChain]: {
    addAction: 'bond_with_lp',
    removeAction: 'unbond_with_lp',
  },
}

type LpPositionData = {
  position: DefiPosition
  runeAmount: number
  assetAmount: number
  poolUnits: string
}

export const LpPositions = () => {
  const chain = useCurrentDefiChain()
  const { t } = useTranslation()
  const selectedIds = useDefiPositions(chain)
  const { positions: availablePositions, isLoading } =
    useAvailableDefiPositions(chain)
  const navigate = useCoreNavigate()
  const vaultAddresses = useCurrentVaultAddresses()

  const selectedPositions = availablePositions.filter(
    position =>
      position.type === 'lp' &&
      isDefiPositionSelected({ position, selectedPositionIds: selectedIds })
  )

  const thorLpQuery = useThorchainLpPositionsQuery({
    selectedPositions: chain === Chain.THORChain ? selectedPositions : [],
  })

  const mayaLpQuery = useMayaLpPositionsQuery({
    selectedPositions: chain === Chain.MayaChain ? selectedPositions : [],
  })

  const lpQuery = chain === Chain.MayaChain ? mayaLpQuery : thorLpQuery

  const actions = lpActionsByChain[chain] ?? lpActionsByChain[Chain.THORChain]

  const handleAdd = (position: DefiPosition) => {
    const poolAsset = position.poolAsset
    if (!poolAsset) return

    const assetChain = getAssetChainFromPool(poolAsset)
    const pairedAddress = assetChain ? vaultAddresses[assetChain] : undefined

    navigate({
      id: 'deposit',
      state: {
        coin: { chain, id: undefined },
        action: actions.addAction,
        form: {
          pool: poolAsset,
          pairedAddress: pairedAddress ?? '',
        },
        entryPoint: 'defi',
      },
    })
  }

  const handleRemove = (
    position: DefiPosition,
    positionData?: LpPositionData
  ) => {
    const poolAsset = position.poolAsset
    if (!poolAsset) return

    navigate({
      id: 'deposit',
      state: {
        coin: { chain, id: undefined },
        action: actions.removeAction,
        form: {
          pool: poolAsset,
          poolUnits: positionData?.poolUnits ?? '0',
        },
        entryPoint: 'defi',
      },
    })
  }

  if (isLoading && selectedPositions.length === 0) {
    return (
      <VStack alignItems="center" gap={12}>
        <Spinner size={20} />
      </VStack>
    )
  }

  if (selectedPositions.length === 0) {
    return <DefiPositionEmptyState returnTab="lps" />
  }

  if (lpQuery.error) {
    return <DefiPositionErrorState onRetry={lpQuery.refetch} />
  }

  const lpDataMap = new Map((lpQuery.data ?? []).map(d => [d.position.id, d]))

  return (
    <VStack gap={12} style={{ marginBottom: 100 }}>
      {selectedPositions.map(position => {
        const pairTicker = getPairTicker(position)
        const baseTicker = getBaseTicker(chain)
        const icon = resolveDefiPositionIcon(position)
        const apr = position.apr
        const aprDisplay = apr !== undefined ? `${apr.toFixed(2)}%` : '\u2014'
        const hasApr = apr !== undefined

        const positionData = lpDataMap.get(position.id)
        const runeAmount = positionData?.runeAmount ?? 0
        const assetAmount = positionData?.assetAmount ?? 0
        const hasPosition = runeAmount > 0 || assetAmount > 0

        return (
          <Card key={position.id}>
            <VStack gap={16}>
              <SectionRow>
                <HStack gap={12} alignItems="center" fullWidth>
                  {position.coin && shouldDisplayChainLogo(position.coin) ? (
                    <WithChainIcon
                      chain={position.coin.chain}
                      style={{ fontSize: 42 }}
                    >
                      <ChainEntityIcon value={icon} />
                    </WithChainIcon>
                  ) : (
                    <ChainEntityIcon value={icon} style={{ fontSize: 42 }} />
                  )}
                  <VStack gap={4}>
                    <Text size={14} color="shy">
                      {t('defi_lp_pool_title', { pool: position.name })}
                    </Text>
                  </VStack>
                </HStack>
              </SectionRow>

              <Divider />

              <StatRow>
                <StatLabel>
                  <PercentIcon />
                  <Text size={13} color="shy">
                    {t('apr')}
                  </Text>
                </StatLabel>
                <StatValue color={hasApr ? 'success' : 'shy'}>
                  {aprDisplay}
                </StatValue>
              </StatRow>

              <VStack gap={8}>
                <Text size={12} color="shy">
                  {t('position_label')}
                </Text>
                <Text size={16} weight={600} color="contrast">
                  {lpQuery.isPending
                    ? '...'
                    : `${formatCryptoAmount(runeAmount)} ${baseTicker} + ${formatCryptoAmount(assetAmount)} ${pairTicker}`}
                </Text>
              </VStack>

              <ActionsRow>
                <Button
                  kind="secondary"
                  disabled={!hasPosition}
                  onClick={() => handleRemove(position, positionData)}
                  icon={<CircleMinusIcon />}
                >
                  {t('defi_remove')}
                </Button>

                <Button
                  onClick={() => handleAdd(position)}
                  icon={<CirclePlusIcon />}
                >
                  {t('defi_add')}
                </Button>
              </ActionsRow>
            </VStack>
          </Card>
        )
      })}
    </VStack>
  )
}
