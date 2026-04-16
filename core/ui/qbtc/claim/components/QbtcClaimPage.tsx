import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Match } from '@lib/ui/base/Match'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useClaimableUtxosQuery } from '../hooks/useClaimableUtxosQuery'
import { useClaimWithProofDisabledQuery } from '../hooks/useClaimWithProofDisabledQuery'
import { ClaimPhase, useQbtcClaimMutation } from '../hooks/useQbtcClaimMutation'
import { ClaimProgress } from './ClaimProgress'
import { ClaimResult } from './ClaimResult'
import { ClaimUtxoSelection } from './ClaimUtxoSelection'

type ClaimStep = 'select' | 'progress' | 'result'

/** Page that drives the QBTC claim flow end-to-end. */
export const QbtcClaimPage = () => {
  const goBack = useNavigateBack()
  const { t } = useTranslation()

  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)
  const utxosQuery = useClaimableUtxosQuery({ btcAddress })
  const disabledQuery = useClaimWithProofDisabledQuery()

  const [step, setStep] = useState<ClaimStep>('select')
  const [phase, setPhase] = useState<ClaimPhase>('idle')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const claimMutation = useQbtcClaimMutation({ setPhase })

  const handleConfirm = (utxos: ClaimableUtxo[]) => {
    setStep('progress')
    claimMutation.mutate(utxos, {
      onSuccess: () => {
        setStep('result')
        setSelected(new Set())
      },
      onError: () => setStep('select'),
    })
  }

  const claimDisabled = disabledQuery.data === true

  return (
    <ScreenLayout title={t('qbtc_claim_title')} onBack={goBack}>
      <VStack gap={16}>
        {claimDisabled && (
          <WarningBlock>{t('qbtc_claim_disabled_notice')}</WarningBlock>
        )}

        {claimMutation.isError && (
          <WarningBlock>
            {claimMutation.error instanceof Error
              ? claimMutation.error.message
              : t('qbtc_claim_failed')}
          </WarningBlock>
        )}

        <Match
          value={step}
          select={() => (
            <MatchQuery
              value={utxosQuery}
              pending={() => <Spinner />}
              error={() => (
                <Text color="danger">{t('qbtc_claim_failed_to_load')}</Text>
              )}
              success={utxos => (
                <ClaimUtxoSelection
                  utxos={utxos}
                  selected={selected}
                  onSelectedChange={setSelected}
                  disabled={claimDisabled}
                  onConfirm={handleConfirm}
                />
              )}
            />
          )}
          progress={() => <ClaimProgress phase={phase} />}
          result={() =>
            claimMutation.data ? (
              <ClaimResult
                totalAmountClaimed={claimMutation.data.totalAmountClaimed}
                utxosClaimed={claimMutation.data.utxosClaimed}
                utxosSkipped={claimMutation.data.utxosSkipped}
                txHash={claimMutation.data.txHash}
                onDone={goBack}
              />
            ) : (
              <Spinner />
            )
          }
        />
      </VStack>
    </ScreenLayout>
  )
}
