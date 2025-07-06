import { BlockaidResultTypes } from '@core/config/security/blockaid/constants'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { TxOverviewChainDataRow } from '@core/ui/chain/tx/TxOverviewRow'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { useKeysignMutation } from '@core/ui/mpc/keysign/action/mutations/useKeysignMutation'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { KeysignSigningState } from '@core/ui/mpc/keysign/flow/KeysignSigningState'
import { KeysignTxOverview } from '@core/ui/mpc/keysign/tx/KeysignTxOverview'
import { SwapKeysignTxOverview } from '@core/ui/mpc/keysign/tx/swap/SwapKeysignTxOverview'
import { TxSuccess } from '@core/ui/mpc/keysign/tx/TxSuccess'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SecurityWarningModal } from '@core/ui/security/components/SecurityWarningModal'
import { useCore } from '@core/ui/state/core'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TxHashProvider } from '../../chain/state/txHash'
import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useKeysignMessagePayload } from './state/keysignMessagePayload'

type KeysignSigningStepProps = Partial<OnBackProp>

export const KeysignSigningStep = ({ onBack }: KeysignSigningStepProps) => {
  const { t } = useTranslation()
  const { version } = useCore()
  const navigate = useCoreNavigate()
  const payload = useKeysignMessagePayload()
  const [{ isDAppSigning }] = useCoreViewState<'keysign'>()
  const [showSecurityCheckmark, setShowSecurityCheckmark] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [blockaidWarning, setBlockaidWarning] = useState<any>(null)
  const [scanUnavailable, setScanUnavailable] = useState(false)
  const [skipBlockaid, setSkipBlockaid] = useState(false)
  const { mutate: startKeysign, ...mutationStatus } = useKeysignMutation(
    payload,
    { skipBlockaid }
  )

  useEffect(() => {
    startKeysign()
  }, [startKeysign])

  useEffect(() => {
    if (mutationStatus.status === 'error' && mutationStatus.error) {
      // Blockaid warning/malicious error
      if (
        (mutationStatus.error as any).type === 'blockaid-warning' ||
        (mutationStatus.error as any).type === 'blockaid-malicious'
      ) {
        setBlockaidWarning((mutationStatus.error as any).blockaid)
        setShowWarningModal(true)
        return
      }
    }
    if (mutationStatus.status !== 'success') return
    const txResults = mutationStatus.data
    if (!txResults || !Array.isArray(txResults) || txResults.length === 0)
      return
    if (!('keysign' in payload)) return
    const keysignPayload = payload.keysign
    if (keysignPayload.swapPayload && keysignPayload.swapPayload.value) return
    // Check if any transaction has a successful scan result
    const hasSuccessfulScan = txResults.some(
      txResult =>
        txResult.scanResult?.validation?.status === 'Success' &&
        txResult.scanResult?.validation?.result_type ===
          BlockaidResultTypes.Benign
    )
    setShowSecurityCheckmark(hasSuccessfulScan)
    // Check if scanUnavailable is true in the result
    setScanUnavailable(
      !!(txResults && txResults[0] && txResults[0].scanUnavailable)
    )
  }, [
    mutationStatus.status,
    mutationStatus.data,
    mutationStatus.error,
    payload,
  ])

  const handleWarningContinue = () => {
    setShowWarningModal(false)
    setSkipBlockaid(true)
  }

  const handleWarningCancel = () => {
    setShowWarningModal(false)
    // Optionally, navigate back or show a message
  }

  return (
    <>
      <SecurityWarningModal
        visible={showWarningModal}
        scan={blockaidWarning}
        onClose={handleWarningCancel}
        onContinue={handleWarningContinue}
      />
      <MatchQuery
        value={mutationStatus}
        success={txResults => {
          const txResult = getLastItem(txResults)
          const handleFinish = () =>
            isDAppSigning ? window.close() : navigate({ id: 'vault' })
          return (
            <>
              <PageHeader title={t('overview')} hasBorder />
              <MatchRecordUnion
                value={payload}
                handlers={{
                  keysign: payload => {
                    const { swapPayload } = payload
                    const isSwapTx = swapPayload && swapPayload.value
                    return isSwapTx ? (
                      <PageContent alignItems="center" scrollable>
                        <SwapKeysignTxOverview
                          txHashes={txResults.map(tx => tx.txHash)}
                          value={payload}
                        />
                      </PageContent>
                    ) : (
                      <StepTransition
                        from={({ onFinish: onSeeTxDetails }) => (
                          <>
                            <PageContent alignItems="center" scrollable>
                              <VStack gap={16} maxWidth={576} fullWidth>
                                {scanUnavailable ? (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 6,
                                      padding: '8px 12px',
                                      backgroundColor:
                                        'var(--color-alertWarning)',
                                      borderRadius: '16px',
                                      marginBottom: 4,
                                    }}
                                  >
                                    <TriangleAlertIcon
                                      color="alertWarning"
                                      fontSize={14}
                                    />
                                    <Text
                                      color="contrast"
                                      size={12}
                                      weight="500"
                                    >
                                      {t('security_scan_unavailable')}
                                    </Text>
                                  </div>
                                ) : null}
                                <TxSuccess
                                  value={payload}
                                  onSeeTxDetails={onSeeTxDetails}
                                  showSecurityCheckmark={
                                    showSecurityCheckmark && !scanUnavailable
                                  }
                                />
                              </VStack>
                            </PageContent>
                            <PageFooter alignItems="center">
                              <VStack maxWidth={576} fullWidth>
                                <Button onClick={handleFinish}>
                                  {t('done')}
                                </Button>
                              </VStack>
                            </PageFooter>
                          </>
                        )}
                        to={() => (
                          <>
                            <PageContent alignItems="center" scrollable>
                              <VStack gap={16} maxWidth={576} fullWidth>
                              <TxHashProvider value={txResult.txHash}>
                                  <KeysignTxOverview />
                                </TxHashProvider>
                              </VStack>
                            </PageContent>
                            <PageFooter alignItems="center">
                              <VStack maxWidth={576} fullWidth>
                                <Button onClick={handleFinish}>
                                  {t('complete')}
                                </Button>
                              </VStack>
                            </PageFooter>
                          </>
                        )}
                      />
                    )
                  },
                  custom: payload => (
                    <>
                      <PageContent scrollable>
                        <TxOverviewPanel>
                          <KeysignCustomMessageInfo value={payload} />
                          <TxOverviewChainDataRow>
                            <span>{t('signature')}</span>
                            <span>{txResult.txHash}</span>
                          </TxOverviewChainDataRow>
                        </TxOverviewPanel>
                      </PageContent>
                      <PageFooter>
                        <Button onClick={handleFinish}>{t('complete')}</Button>
                      </PageFooter>
                    </>
                  ),
                }}
              />
            </>
          )
        }}
        error={error => (
          <FullPageFlowErrorState
            errorMessage={extractErrorMsg(error)}
            message={t('signing_error')}
          />
        )}
        pending={() => (
          <>
            <PageHeader
              primaryControls={<PageHeaderBackButton onClick={onBack} />}
              title={t('keysign')}
              hasBorder
            />
            <PageContent scrollable>
              <KeysignSigningState />
            </PageContent>
            <PageFooter alignItems="center">
              <Text color="shy" size={12}>
                {t('version')} {version}
              </Text>
            </PageFooter>
          </>
        )}
      />
    </>
  )
}
