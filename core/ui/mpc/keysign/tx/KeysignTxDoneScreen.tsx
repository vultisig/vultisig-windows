import { DappRequestBanner } from '@core/ui/dapp/DappRequestBanner'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { ValueProp } from '@lib/ui/props'
import { getKeysignLimitSwapCancel } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapCancel'
import { getKeysignLimitSwapOrder } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapOrder'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useTranslation } from 'react-i18next'

import { KeysignTxOverview } from './KeysignTxOverview'
import { LimitOrderCancelDoneHint } from './LimitOrderCancelDoneHint'
import { LimitOrdersDoneHint } from './LimitOrdersDoneHint'
import { TxSuccess } from './TxSuccess'

type KeysignTxDoneScreenProps = ValueProp<KeysignPayload> & {
  toAddressLabel?: string
}

/**
 * Done screen for a signed non-swap transaction: one hero describing what was
 * signed, with the detail rows expanding in place beneath it.
 *
 * The details used to be a screen of their own, which rebuilt the hero from the
 * raw payload alone and so contradicted the one the user had just read — an
 * ERC-20 approve turned into a `0 ETH` contract execution on the way in
 * (#5028). Keeping both on one screen, the way iOS `DoneScreen` and Android
 * `TxDoneScaffold` do, leaves no second hero to disagree.
 */
export const KeysignTxDoneScreen = ({
  toAddressLabel,
  value,
}: KeysignTxDoneScreenProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { goHome, isLimited } = useCore()
  const [areTxDetailsOpen, { toggle: toggleTxDetails }] = useBoolean(false)

  return (
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
            <DappRequestBanner value={value.dappMetadata} />
            <TxSuccess
              value={value}
              areTxDetailsOpen={areTxDetailsOpen}
              onToggleTxDetails={toggleTxDetails}
              txDetails={<KeysignTxOverview toAddressLabel={toAddressLabel} />}
            />
            {getKeysignLimitSwapOrder(value) ? <LimitOrdersDoneHint /> : null}
            {getKeysignLimitSwapCancel(value) ? (
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
            {/* The dApp popup has no Limit Orders view to navigate to. */}
            {getKeysignLimitSwapOrder(value) && !isLimited ? (
              <Button
                kind="secondary"
                onClick={() => navigate({ id: 'limitOrders' })}
              >
                {t('track')}
              </Button>
            ) : null}
            <Button data-testid="tx-success-done" onClick={goHome}>
              {t('done')}
            </Button>
          </VStack>
        </AnimatedVisibility>
      </PageFooter>
    </>
  )
}
