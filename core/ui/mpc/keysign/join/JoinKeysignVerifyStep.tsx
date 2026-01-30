import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { JoinKeysignSwapVerify } from '@core/ui/mpc/keysign/join/tx/JoinKeysignSwapVerify'
import { JoinKeysignTxPrimaryInfo } from '@core/ui/mpc/keysign/join/tx/JoinKeysignTxPrimaryInfo'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Button } from '@lib/ui/buttons/Button'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const JoinKeysignVerifyStep = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const [{ keysignMsg }] = useCoreViewState<'joinKeysign'>()

  const keysignPayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('verify')}
        hasBorder
      />
      <PageContent>
        <WithProgressIndicator value={0.6}>
          <MatchRecordUnion
            value={keysignPayload}
            handlers={{
              keysign: payload =>
                payload.swapPayload?.value ? (
                  <JoinKeysignSwapVerify value={payload} />
                ) : (
                  <TxOverviewPanel>
                    <JoinKeysignTxPrimaryInfo value={payload} />
                  </TxOverviewPanel>
                ),
              custom: value => (
                <TxOverviewPanel>
                  <KeysignCustomMessageInfo value={value} />
                </TxOverviewPanel>
              ),
            }}
          />
        </WithProgressIndicator>
        <Button onClick={onFinish}>{t('join_keysign')}</Button>
      </PageContent>
    </>
  )
}
