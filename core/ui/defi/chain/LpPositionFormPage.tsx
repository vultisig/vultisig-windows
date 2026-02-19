import { Chain } from '@core/chain/Chain'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import {
  lpChainMap,
  useAvailableDefiPositions,
} from '@core/ui/storage/defiPositions'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const LpPositionFormPage = () => {
  const [{ action, positionId, chain }] = useCoreViewState<'lpPositionForm'>()
  const { goBack } = useCore()
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { positions } = useAvailableDefiPositions(chain)
  const vaultAddresses = useCurrentVaultAddresses()

  useEffect(() => {
    const position = positions.find(p => p.id === positionId)
    if (!position?.poolAsset) return

    const poolAsset = position.poolAsset
    const [chainCode] = poolAsset.split('.')
    const assetChain = chainCode
      ? lpChainMap[chainCode.toUpperCase()]
      : undefined
    const pairedAddress = assetChain ? vaultAddresses[assetChain] : undefined

    if (action === 'add') {
      navigate({
        id: 'deposit',
        state: {
          coin: { chain: Chain.THORChain, id: undefined },
          action: 'add_thor_lp',
          form: { pool: poolAsset, pairedAddress: pairedAddress ?? '' },
          entryPoint: 'defi',
        },
      })
    } else {
      navigate({
        id: 'deposit',
        state: {
          coin: { chain: Chain.THORChain, id: undefined },
          action: 'remove_thor_lp',
          form: { pool: poolAsset },
          entryPoint: 'defi',
        },
      })
    }
  }, [action, chain, navigate, positionId, positions, vaultAddresses])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={t('defi_lp_position_form_title', { action })}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <VStack gap={8} alignItems="center">
          <Text size={14} color="shy">
            {t('loading')}
          </Text>
        </VStack>
      </PageContent>
    </VStack>
  )
}
