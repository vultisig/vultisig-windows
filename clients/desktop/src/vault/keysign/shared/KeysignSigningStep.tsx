import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { Match } from '@lib/ui/base/Match'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { CurrentTxHashProvider } from '../../../chain/state/currentTxHash'
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel'
import { TxOverviewChainDataRow } from '../../../chain/tx/components/TxOverviewRow'
import useVersionCheck from '../../../lib/hooks/useVersionCheck'
import { makeAppPath } from '../../../navigation'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { KeysignCustomMessageInfo } from '../join/verify/KeysignCustomMessageInfo'
import { KeysignSigningState } from './KeysignSigningState'
import { KeysignTxOverview } from './KeysignTxOverview'
import { useKeysignMutation } from './mutations/useKeysignMutation'
import { SwapKeysignTxOverview } from './SwapKeysignTxOverview'

type KeysignSigningStepProps = {
  payload: KeysignMessagePayload
} & Partial<OnBackProp>

export const KeysignSigningStep = ({
  onBack,
  payload,
}: KeysignSigningStepProps) => {
  const { t } = useTranslation()
  const { localVersion } = useVersionCheck()

  const { mutate: startKeysign, ...mutationStatus } =
    useKeysignMutation(payload)

  useEffect(startKeysign, [startKeysign])

  return (
    <MatchQuery
      value={mutationStatus}
      success={value => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('overview')}</PageHeaderTitle>}
          />
          <PageContent>
            <MatchRecordUnion
              value={payload}
              handlers={{
                keysign: payload => (
                  <CurrentTxHashProvider value={value}>
                    <Match
                      value={payload.swapPayload.value ? 'swap' : 'default'}
                      swap={() => <SwapKeysignTxOverview value={payload} />}
                      default={() => (
                        <>
                          <TxOverviewPanel>
                            <KeysignTxOverview value={payload} />
                          </TxOverviewPanel>
                          <Link to={makeAppPath('vault')}>
                            <Button as="div">{t('complete')}</Button>
                          </Link>
                        </>
                      )}
                    />
                  </CurrentTxHashProvider>
                ),
                custom: payload => (
                  <TxOverviewPanel>
                    <KeysignCustomMessageInfo value={payload} />
                    <TxOverviewChainDataRow>
                      <span>{t('signature')}</span>
                      <span>{value}</span>
                    </TxOverviewChainDataRow>
                  </TxOverviewPanel>
                ),
              }}
            />
          </PageContent>
        </>
      )}
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
                Version {localVersion}
              </Text>
            </VStack>
          </PageContent>
        </>
      )}
    />
  )
}
