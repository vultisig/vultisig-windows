import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { JoinKeysignCustomMessageVerify } from '@core/ui/mpc/keysign/join/JoinKeysignCustomMessageVerify'
import { JoinKeysignButton } from '@core/ui/mpc/keysign/join/tx/JoinKeysignButton'
import { JoinKeysignTransactionVerify } from '@core/ui/mpc/keysign/join/tx/JoinKeysignTransactionVerify'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { getKeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
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
      <MatchRecordUnion
        value={keysignPayload}
        handlers={{
          keysign: payload => (
            <JoinKeysignTransactionVerify value={payload} onFinish={onFinish} />
          ),
          custom: value => (
            <>
              <PageContent scrollable>
                <VStack flexGrow>
                  <JoinKeysignCustomMessageVerify value={value} />
                </VStack>
              </PageContent>
              <PageFooter>
                <JoinKeysignButton onClick={onFinish} />
              </PageFooter>
            </>
          ),
        }}
      />
    </>
  )
}
