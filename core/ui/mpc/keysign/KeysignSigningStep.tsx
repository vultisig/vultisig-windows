import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { TxOverviewChainDataRow } from '@core/ui/chain/tx/TxOverviewRow'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { useKeysignMutation } from '@core/ui/mpc/keysign/action/mutations/useKeysignMutation'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { KeysignSigningState } from '@core/ui/mpc/keysign/flow/KeysignSigningState'
import { KeysignTxOverview } from '@core/ui/mpc/keysign/tx/KeysignTxOverview'
import { SwapKeysignTxOverview } from '@core/ui/mpc/keysign/tx/swap/SwapKeysignTxOverview'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Match } from '@lib/ui/base/Match'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCore } from '../../state/core'
import { normalizeTxHash } from './utils/normalizeTxHash'

type KeysignSigningStepProps = {
  payload: KeysignMessagePayload
} & Partial<OnBackProp>

export const KeysignSigningStep = ({
  onBack,
  payload,
}: KeysignSigningStepProps) => {
  const { t } = useTranslation()
  const { version } = useCore()

  const { mutate: startKeysign, ...mutationStatus } =
    useKeysignMutation(payload)

  useEffect(startKeysign, [startKeysign])

  const navigate = useCoreNavigate()

  return (
    <MatchQuery
      value={mutationStatus}
      success={txHashes => {
        const txHash = getLastItem(txHashes)

        return (
          <>
            <PageHeader
              title={<PageHeaderTitle>{t('overview')}</PageHeaderTitle>}
            />
            <PageContent>
              <MatchRecordUnion
                value={payload}
                handlers={{
                  keysign: payload => (
                    <Match
                      value={payload.swapPayload.value ? 'swap' : 'default'}
                      swap={() => (
                        <SwapKeysignTxOverview
                          txHashes={txHashes}
                          value={payload}
                        />
                      )}
                      default={() => (
                        <>
                          <TxOverviewPanel>
                            <KeysignTxOverview
                              txHash={normalizeTxHash(txHash, {
                                memo: payload?.memo,
                              })}
                              value={payload}
                            />
                          </TxOverviewPanel>
                          <Button onClick={() => navigate({ id: 'vault' })}>
                            {t('complete')}
                          </Button>
                        </>
                      )}
                    />
                  ),
                  custom: payload => (
                    <TxOverviewPanel>
                      <KeysignCustomMessageInfo value={payload} />
                      <TxOverviewChainDataRow>
                        <span>{t('signature')}</span>
                        <span>{txHash}</span>
                      </TxOverviewChainDataRow>
                    </TxOverviewPanel>
                  ),
                }}
              />
            </PageContent>
          </>
        )
      }}
      error={error => (
        <FullPageFlowErrorState
          message={t('signing_error')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={<PageHeaderTitle>{t('keysign')}</PageHeaderTitle>}
          />
          <PageContent data-testid="KeysignVerifyStep-PageContent">
            <VStack flexGrow>
              <KeysignSigningState />
            </VStack>
            <VStack alignItems="center">
              <Text color="shy" size={12}>
                {t('version')} {version}
              </Text>
            </VStack>
          </PageContent>
        </>
      )}
    />
  )
}
