import { areEqualCoins } from '@core/chain/coin/Coin'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { ChildrenProp } from '@lib/ui/props'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const DepositAccessGuard = ({ children }: ChildrenProp) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const vaultCoins = useCurrentVaultCoins()
  const navigate = useCoreNavigate()
  const { goBack } = useCore()
  const { t } = useTranslation()

  const hasCoinInVault = useMemo(
    () => vaultCoins.some(coin => areEqualCoins(coin, coinKey)),
    [coinKey, vaultCoins]
  )

  if (hasCoinInVault) {
    return <>{children}</>
  }

  const tickerLabel =
    (coinKey as any)?.ticker ?? coinKey.id ?? coinKey.chain ?? t('asset')

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('deposit')}
        hasBorder
      />
      <PageContent gap={16}>
        <EmptyState
          title={t('defi_token_required', { ticker: tickerLabel })}
          description={t('defi_token_required_description', {
            ticker: tickerLabel,
          })}
        />
        <HStack gap={12}>
          <Button kind="secondary" onClick={goBack}>
            {t('back')}
          </Button>
          <Button
            onClick={() =>
              navigate({
                id: 'manageVaultChainCoins',
                state: { chain: coinKey.chain },
              })
            }
          >
            {t('manage_tokens')}
          </Button>
        </HStack>
      </PageContent>
    </VStack>
  )
}
