import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { useClaimableUtxosQuery } from '../hooks/useClaimableUtxosQuery'
import { useClaimWithProofDisabledQuery } from '../hooks/useClaimWithProofDisabledQuery'
import { ClaimableUtxoList } from './ClaimableUtxoList'

/** Page that displays claimable QBTC UTXOs for the current vault's Bitcoin address. */
export const QbtcClaimPage = () => {
  const goBack = useNavigateBack()
  const { t } = useTranslation()

  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)
  const utxosQuery = useClaimableUtxosQuery({ btcAddress })
  const disabledQuery = useClaimWithProofDisabledQuery()

  return (
    <ScreenLayout title={t('qbtc_claim_title')} onBack={goBack}>
      <VStack gap={16}>
        {disabledQuery.data === true && (
          <WarningBlock>{t('qbtc_claim_disabled_notice')}</WarningBlock>
        )}

        <MatchQuery
          value={utxosQuery}
          pending={() => <Spinner />}
          error={() => (
            <Text color="danger">{t('qbtc_claim_failed_to_load')}</Text>
          )}
          success={utxos => <ClaimableUtxoList utxos={utxos} />}
        />
      </VStack>
    </ScreenLayout>
  )
}
