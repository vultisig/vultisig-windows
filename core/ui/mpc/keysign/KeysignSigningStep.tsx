import { DappRequestBanner } from '@core/ui/dapp/DappRequestBanner'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useKeysignMutation } from '@core/ui/mpc/keysign/action/mutations/useKeysignMutation'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { KeysignSigningState } from '@core/ui/mpc/keysign/flow/KeysignSigningState'
import { KeysignTxOverview } from '@core/ui/mpc/keysign/tx/KeysignTxOverview'
import { LimitOrdersDoneHint } from '@core/ui/mpc/keysign/tx/LimitOrdersDoneHint'
import { SwapKeysignTxOverview } from '@core/ui/mpc/keysign/tx/swap/SwapKeysignTxOverview'
import { TxSuccess } from '@core/ui/mpc/keysign/tx/TxSuccess'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getKeysignLimitSwapCancel } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapCancel'
import { getKeysignLimitSwapOrder } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapOrder'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { ReactNode, useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'

import { TxHashProvider } from '../../chain/state/txHash'
import { BroadcastRefusedError } from './assertReadyToBroadcast'
import { BroadcastError } from './broadcastKeysignTx'
import { KeysignBroadcastRefusal } from './KeysignBroadcastRefusal'
import { useKeysignMessagePayload } from './state/keysignMessagePayload'
import { LimitOrderCancelDoneHint } from './tx/LimitOrderCancelDoneHint'

type KeysignSigningStepProps = Partial<OnBackProp> & {
  onSettled?: () => void
  onStart?: () => void
  renderPending?: () => ReactNode
  toAddressLabel?: string
}

const isDklsMaliciousPartyError = (error: unknown) => {
  if (error instanceof Error && error.name === 'DklsMaliciousPartyError') {
    return true
  }

  return extractErrorMsg(error).includes('DKLS keysign aborted because party')
}

export const KeysignSigningStep = ({
  onBack,
  onSettled,
  onStart,
  renderPending,
  toAddressLabel,
}: KeysignSigningStepProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { version, goHome } = useCore()
  const vault = useCurrentVault()
  const payload = useKeysignMessagePayload()
  const { mutate: startKeysign, ...mutationStatus } =
    useKeysignMutation(payload)
  const [, copyToClipboard] = useCopyToClipboard()
  useLayoutEffect(() => onStart?.(), [onStart])
  useLayoutEffect(() => {
    if (mutationStatus.isError || mutationStatus.isSuccess) onSettled?.()
  }, [mutationStatus.isError, mutationStatus.isSuccess, onSettled])
  useEffect(startKeysign, [startKeysign])

  return (
    <MatchQuery
      value={mutationStatus}
      success={result => (
        <>
          <MatchRecordUnion
            value={payload}
            handlers={{
              keysign: payload => {
                // A QBTC claim co-sign produces a raw signature, not a tx —
                // the initiating device broadcasts. Show a simple confirmation
                // instead of the tx-overview path (which expects `txs`).
                if (payload.isQbtcClaim) {
                  return (
                    <>
                      <PageHeader title={t('done')} hasBorder />
                      <PageContent alignItems="center" scrollable>
                        <VStack gap={16} maxWidth={576} fullWidth>
                          <Panel>
                            <Text>{t('qbtc_claim_cosign_success')}</Text>
                          </Panel>
                        </VStack>
                      </PageContent>
                      <PageFooter alignItems="center">
                        <VStack maxWidth={576} fullWidth>
                          <Button onClick={goHome}>{t('complete')}</Button>
                        </VStack>
                      </PageFooter>
                    </>
                  )
                }

                const { swapPayload } = payload
                const isSwapTx = swapPayload && swapPayload.value
                const txs = getRecordUnionValue(result, 'txs')

                return (
                  <TxHashProvider value={getLastItem(txs).hash}>
                    {isSwapTx ? (
                      <>
                        <PageHeader title={t('done')} hasBorder />
                        <PageContent alignItems="center" scrollable>
                          <AnimatedVisibility
                            animationConfig="bottomToTop"
                            overlayStyles={{
                              display: 'flex',
                              justifyContent: 'center',
                              width: '100%',
                            }}
                          >
                            <SwapKeysignTxOverview
                              txHashes={txs.map(tx => tx.hash)}
                              value={payload}
                            />
                          </AnimatedVisibility>
                        </PageContent>
                      </>
                    ) : (
                      <StepTransition
                        from={({ onFinish: onSeeTxDetails }) => (
                          <>
                            <PageHeader title={t('done')} hasBorder />
                            <PageContent alignItems="center" scrollable>
                              <AnimatedVisibility
                                animationConfig="bottomToTop"
                                overlayStyles={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  width: '100%',
                                }}
                              >
                                <VStack gap={16} maxWidth={576} fullWidth>
                                  <DappRequestBanner
                                    value={payload.dappMetadata}
                                  />
                                  <TxSuccess
                                    value={payload}
                                    onSeeTxDetails={onSeeTxDetails}
                                  />
                                  {getKeysignLimitSwapOrder(payload) ? (
                                    <LimitOrdersDoneHint />
                                  ) : null}
                                  {getKeysignLimitSwapCancel(payload) ? (
                                    <LimitOrderCancelDoneHint />
                                  ) : null}
                                </VStack>
                              </AnimatedVisibility>
                            </PageContent>
                            <PageFooter alignItems="center">
                              <AnimatedVisibility
                                delay={180}
                                animationConfig="bottomToTop"
                                overlayStyles={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  width: '100%',
                                }}
                              >
                                <VStack maxWidth={576} fullWidth gap={8}>
                                  {getKeysignLimitSwapOrder(payload) ? (
                                    <Button
                                      kind="secondary"
                                      onClick={() =>
                                        navigate({ id: 'limitOrders' })
                                      }
                                    >
                                      {t('track')}
                                    </Button>
                                  ) : null}
                                  <Button
                                    data-testid="tx-success-done"
                                    onClick={goHome}
                                  >
                                    {t('done')}
                                  </Button>
                                </VStack>
                              </AnimatedVisibility>
                            </PageFooter>
                          </>
                        )}
                        to={({ onBack: onBackToReceipt }) => (
                          <>
                            <FlowPageHeader
                              title={t('transaction_details')}
                              onBack={onBackToReceipt}
                            />
                            <PageContent alignItems="center" scrollable>
                              <VStack gap={16} maxWidth={576} fullWidth>
                                <DappRequestBanner
                                  value={payload.dappMetadata}
                                />
                                <KeysignTxOverview
                                  toAddressLabel={toAddressLabel}
                                />
                              </VStack>
                            </PageContent>
                            <PageFooter alignItems="center">
                              <VStack maxWidth={576} fullWidth>
                                <Button onClick={goHome}>
                                  {t('complete')}
                                </Button>
                              </VStack>
                            </PageFooter>
                          </>
                        )}
                      />
                    )}
                  </TxHashProvider>
                )
              },
              custom: payload => {
                const signature = getRecordUnionValue(result, 'signature')

                return (
                  <>
                    <PageHeader title={t('done')} hasBorder />
                    <PageContent alignItems="center" scrollable>
                      <VStack gap={16} maxWidth={576} fullWidth>
                        <Panel>
                          <SeparatedByLine gap={16}>
                            <KeysignCustomMessageInfo value={payload} />
                            <HStack
                              alignItems="center"
                              gap={4}
                              justifyContent="space-between"
                            >
                              <Text color="shy" weight="500">
                                {t('signature')}
                              </Text>
                              <HStack alignItems="center" gap={4}>
                                <MiddleTruncate text={signature} width={140} />
                                <IconButton
                                  onClick={() => copyToClipboard(signature)}
                                >
                                  <ClipboardCopyIcon />
                                </IconButton>
                              </HStack>
                            </HStack>
                          </SeparatedByLine>
                        </Panel>
                      </VStack>
                    </PageContent>
                    <PageFooter alignItems="center">
                      <VStack maxWidth={576} fullWidth>
                        <Button onClick={goHome}>{t('complete')}</Button>
                      </VStack>
                    </PageFooter>
                  </>
                )
              },
            }}
          />
        </>
      )}
      error={error => {
        const isSessionConflict =
          isKeyImportVault(vault) &&
          extractErrorMsg(error).includes('final_session_id')

        if (isSessionConflict) {
          return (
            <FullPageFlowErrorState
              variant="warning"
              title={t('fast_vault_session_conflict')}
              description={t('fast_vault_session_conflict_description')}
            />
          )
        }

        // Signing succeeded but this device refused to broadcast (e.g. the
        // swap's inbound vault rotated mid-ceremony). Co-signers broadcast the
        // same signed tx independently, so this is not a terminal failure:
        // keep the hash on screen and track the real on-chain outcome.
        if (error instanceof BroadcastRefusedError) {
          return <KeysignBroadcastRefusal error={error} />
        }

        // Signing succeeded but the network rejected the broadcast — headline it
        // as an on-chain failure, not a device/connection timeout. The raw RPC
        // reason stays available under "Show exact error".
        if (error instanceof BroadcastError) {
          return (
            <FullPageFlowErrorState
              variant="error"
              error={error}
              title={t('broadcast_error')}
              description={t('broadcast_error_description')}
            />
          )
        }

        if (isDklsMaliciousPartyError(error)) {
          return (
            <FullPageFlowErrorState
              variant="error"
              error={error}
              title={t('keysign_malicious_party_error')}
              description={t('keysign_malicious_party_error_description')}
            />
          )
        }

        return (
          <FullPageFlowErrorState
            variant="error"
            error={error}
            title={t('signing_error')}
            description={t('signing_error_description')}
          />
        )
      }}
      pending={() =>
        renderPending ? (
          renderPending()
        ) : (
          <>
            <PageHeader
              primaryControls={<PageHeaderBackButton onClick={onBack} />}
              title={t('keysign')}
              hasBorder
            />
            <KeysignSigningState />
            <PageFooter alignItems="center">
              <Text color="shy" size={12}>
                {t('version')} {version}
              </Text>
            </PageFooter>
          </>
        )
      }
    />
  )
}
