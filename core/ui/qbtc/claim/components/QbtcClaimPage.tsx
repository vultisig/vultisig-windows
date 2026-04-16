import { FastVaultPasswordModal } from '@core/ui/mpc/fast/FastVaultPasswordModal'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
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
import { QbtcClaimResultData } from './ClaimBroadcastingPhase'
import { ClaimResult } from './ClaimResult'
import { ClaimRunner } from './ClaimRunner'
import { ClaimUtxoSelection } from './ClaimUtxoSelection'

type ClaimStep =
  | { select: null }
  | { claiming: { utxos: ClaimableUtxo[]; password: string } }
  | { result: { data: QbtcClaimResultData } }

/** Page that drives the QBTC claim flow end-to-end. */
export const QbtcClaimPage = () => {
  const goBack = useNavigateBack()
  const { t } = useTranslation()

  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)
  const utxosQuery = useClaimableUtxosQuery({ btcAddress })
  const disabledQuery = useClaimWithProofDisabledQuery()
  const securityType = useCurrentVaultSecurityType()

  const [step, setStep] = useState<ClaimStep>({ select: null })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingUtxos, setPendingUtxos] = useState<ClaimableUtxo[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Fail closed — stay disabled until the kill-switch query has resolved.
  const claimDisabled =
    disabledQuery.isPending ||
    disabledQuery.isError ||
    disabledQuery.data === true
  const isFastVault = securityType === 'fast'

  const handleConfirm = (utxos: ClaimableUtxo[]) => {
    setError(null)
    setPendingUtxos(utxos)
  }

  const handlePasswordFinish = ({ password }: { password: string }) => {
    if (!pendingUtxos) return
    setStep({ claiming: { utxos: pendingUtxos, password } })
    setPendingUtxos(null)
  }

  const handlePasswordCancel = () => setPendingUtxos(null)

  const handleRunnerSuccess = (data: QbtcClaimResultData) => {
    setSelected(new Set())
    setStep({ result: { data } })
  }

  const handleRunnerError = (err: Error) => {
    setError(err)
    setStep({ select: null })
  }

  return (
    <MatchRecordUnion
      value={step}
      handlers={{
        select: () => (
          <ScreenLayout title={t('qbtc_claim_title')} onBack={goBack}>
            <VStack gap={16}>
              {claimDisabled && (
                <WarningBlock>{t('qbtc_claim_disabled_notice')}</WarningBlock>
              )}
              {!isFastVault && (
                <WarningBlock>{t('qbtc_claim_fast_vault_only')}</WarningBlock>
              )}
              {error && (
                <WarningBlock>
                  {error.message || t('qbtc_claim_failed')}
                </WarningBlock>
              )}

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
                    disabled={claimDisabled || !isFastVault}
                    onConfirm={handleConfirm}
                  />
                )}
              />
            </VStack>

            <FastVaultPasswordModal
              showModal={pendingUtxos !== null}
              onBack={handlePasswordCancel}
              onFinish={handlePasswordFinish}
              description={t('qbtc_claim_password_description')}
              withPasswordCache
            />
          </ScreenLayout>
        ),
        claiming: ({ utxos, password }) => (
          <ClaimRunner
            utxos={utxos}
            password={password}
            onSuccess={handleRunnerSuccess}
            onError={handleRunnerError}
          />
        ),
        result: ({ data }) => (
          <ScreenLayout title={t('qbtc_claim_title')} onBack={goBack}>
            <ClaimResult
              totalAmountClaimed={data.totalAmountClaimed}
              utxosClaimed={data.utxosClaimed}
              utxosSkipped={data.utxosSkipped}
              txHash={data.txHash}
              onDone={goBack}
            />
          </ScreenLayout>
        ),
      }}
    />
  )
}
