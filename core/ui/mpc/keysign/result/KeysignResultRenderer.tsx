import { Tx } from '@core/chain/tx'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { TxOverviewChainDataRow } from '@core/ui/chain/tx/TxOverviewRow'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { KeysignTxOverview } from '@core/ui/mpc/keysign/tx/KeysignTxOverview'
import { SwapKeysignTxOverview } from '@core/ui/mpc/keysign/tx/swap/SwapKeysignTxOverview'
import { TxSuccess } from '@core/ui/mpc/keysign/tx/TxSuccess'
import { useCore } from '@core/ui/state/core'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { TxHashProvider } from '../../../chain/state/txHash'
import { useKeysignResultContext } from './KeysignResultProvider'

type KeysignResultRendererProps = {
  result:
    | {
        txs: Tx[]
      }
    | {
        signature: string
      }
  payload: KeysignMessagePayload
}

export const KeysignResultRenderer = ({
  result,
  payload,
}: KeysignResultRendererProps) => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const { customResultRenderer } = useKeysignResultContext()

  if (customResultRenderer) {
    return <>{customResultRenderer(result, payload)}</>
  }

  return (
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
                          <Button onClick={goHome}>{t('complete')}</Button>
                        </VStack>
                      </PageFooter>
                    </>
                  )}
                />
              )}
            </TxHashProvider>
          )
        },
        custom: payload => (
          <>
            <PageContent scrollable>
              <TxOverviewPanel>
                <KeysignCustomMessageInfo value={payload} />
                <TxOverviewChainDataRow>
                  <span>{t('signature')}</span>
                  <span>{getRecordUnionValue(result, 'signature')}</span>
                </TxOverviewChainDataRow>
              </TxOverviewPanel>
            </PageContent>
            <PageFooter>
              <Button onClick={goHome}>{t('complete')}</Button>
            </PageFooter>
          </>
        ),
      }}
    />
  )
}
