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
import { useCore } from '@core/ui/state/core'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
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
import { useEffect } from 'react'
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
  const { mutate: startKeysign, ...mutationStatus } =
    useKeysignMutation(payload)

  useEffect(startKeysign, [startKeysign])

  return (
    <MatchQuery
      value={mutationStatus}
      success={txResults => {
        const txResult = getLastItem(txResults)

        const handleFinish = () =>
          isDAppSigning ? window.close() : navigate({ id: 'vault' })

        return (
          <TxHashProvider value={txResult.txHash}>
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
                              <TxSuccess
                                value={payload}
                                onSeeTxDetails={onSeeTxDetails}
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
                              <KeysignTxOverview />
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
          </TxHashProvider>
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
  )
}
