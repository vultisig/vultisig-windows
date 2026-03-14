import {
  formatMoneroAtomicAmount,
  isMoneroBalanceFinalisePayload,
} from '@core/chain/chains/monero/balanceFinaliseMessage'
import { moneroBalanceFinaliseMethod } from '@core/chain/chains/monero/balanceFinaliseMessage'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useKeysignMutation } from '@core/ui/mpc/keysign/action/mutations/useKeysignMutation'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { KeysignSigningState } from '@core/ui/mpc/keysign/flow/KeysignSigningState'
import { KeysignTxOverview } from '@core/ui/mpc/keysign/tx/KeysignTxOverview'
import { SwapKeysignTxOverview } from '@core/ui/mpc/keysign/tx/swap/SwapKeysignTxOverview'
import { TxSuccess } from '@core/ui/mpc/keysign/tx/TxSuccess'
import { useCore } from '@core/ui/state/core'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
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
import { getLastItem } from '@lib/utils/array/getLastItem'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { TxHashProvider } from '../../chain/state/txHash'
import { useKeysignMessagePayload } from './state/keysignMessagePayload'

type KeysignSigningStepProps = Partial<OnBackProp>

const MoneroResultRow = styled(HStack)`
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`

const MoneroResultValue = styled(Text)`
  text-align: right;
`

export const KeysignSigningStep = ({ onBack }: KeysignSigningStepProps) => {
  const { t } = useTranslation()
  const { version, goHome } = useCore()
  const payload = useKeysignMessagePayload()
  const { mutate: startKeysign, ...mutationStatus } =
    useKeysignMutation(payload)
  const [, copyToClipboard] = useCopyToClipboard()
  const pageTitle =
    'custom' in payload && isMoneroBalanceFinalisePayload(payload.custom)
      ? t('finalise_balance_scan')
      : t('overview')
  const signingStateTitle =
    'custom' in payload && payload.custom.method === moneroBalanceFinaliseMethod
      ? t('revealing_outputs')
      : t('signing_transaction')

  useEffect(startKeysign, [startKeysign])

  return (
    <MatchQuery
      value={mutationStatus}
      success={result => (
        <>
          <PageHeader title={pageTitle} hasBorder />
          <MatchRecordUnion
            value={payload}
            handlers={{
              keysign: payload => {
                const { swapPayload } = payload
                const isSwapTx = swapPayload && swapPayload.value
                const txs = getRecordUnionValue(result, 'txs')

                return (
                  <TxHashProvider value={getLastItem(txs).hash}>
                    {isSwapTx ? (
                      <PageContent alignItems="center" scrollable>
                        <SwapKeysignTxOverview
                          txHashes={txs.map(tx => tx.hash)}
                          value={payload}
                        />
                      </PageContent>
                    ) : (
                      <StepTransition
                        from={({ onFinish: onSeeTxDetails }) => (
                          <>
                            <PageContent alignItems="center" scrollable>
                              <VStack gap={16} maxWidth={576} fullWidth>
                                <TxSuccess
                                  value={payload}
                                  onSeeTxDetails={onSeeTxDetails}
                                />
                              </VStack>
                            </PageContent>
                            <PageFooter alignItems="center">
                              <VStack maxWidth={576} fullWidth>
                                <Button onClick={goHome}>{t('done')}</Button>
                              </VStack>
                            </PageFooter>
                          </>
                        )}
                        to={() => (
                          <>
                            <PageContent alignItems="center" scrollable>
                              <VStack gap={16} maxWidth={576} fullWidth>
                                <KeysignTxOverview />
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
                if (
                  'moneroBalanceFinalise' in result &&
                  isMoneroBalanceFinalisePayload(payload)
                ) {
                  return (
                    <>
                      <PageContent scrollable>
                        <TxOverviewPanel>
                          {result.moneroBalanceFinalise.spentOutputs !=
                            null && (
                            <MoneroResultRow>
                              <Text color="shy">{t('spent_outputs')}</Text>
                              <MoneroResultValue size={24} weight={400}>
                                {result.moneroBalanceFinalise.spentOutputs.toLocaleString()}
                              </MoneroResultValue>
                            </MoneroResultRow>
                          )}
                          {result.moneroBalanceFinalise.unspentOutputs !=
                            null && (
                            <MoneroResultRow>
                              <Text color="shy">{t('unspent_outputs')}</Text>
                              <MoneroResultValue size={24} weight={400}>
                                {result.moneroBalanceFinalise.unspentOutputs.toLocaleString()}
                              </MoneroResultValue>
                            </MoneroResultRow>
                          )}
                          {result.moneroBalanceFinalise.balance != null && (
                            <MoneroResultRow>
                              <Text color="shy">{t('final_balance')}</Text>
                              <MoneroResultValue
                                color="primary"
                                size={24}
                                weight={400}
                              >
                                {formatMoneroAtomicAmount(
                                  result.moneroBalanceFinalise.balance
                                )}
                              </MoneroResultValue>
                            </MoneroResultRow>
                          )}
                        </TxOverviewPanel>
                      </PageContent>
                      <PageFooter>
                        <Button onClick={goHome}>{t('complete')}</Button>
                      </PageFooter>
                    </>
                  )
                }

                const signature = getRecordUnionValue(result, 'signature')

                return (
                  <>
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
      error={error => (
        <FullPageFlowErrorState error={error} title={t('signing_error')} />
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={t('keysign')}
            hasBorder
          />
          <PageContent scrollable>
            <KeysignSigningState title={signingStateTitle} />
          </PageContent>
          <PageFooter alignItems="center">
            <Text color="shy" size={12}>
              {t('version')} {version}
            </Text>
          </PageFooter>
        </>
      )}
      inactive={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={t('keysign')}
            hasBorder
          />
          <PageContent scrollable>
            <KeysignSigningState title={signingStateTitle} />
          </PageContent>
          <PageFooter alignItems="center">
            <Text color="shy" size={12}>
              {t('version')} {version}
            </Text>
          </PageFooter>
        </>
      )}
    />
  )
}
