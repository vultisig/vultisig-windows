import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ActionForm } from '@core/ui/vault/components/action-form/ActionForm'
import { useSyncAllowDeathAmount } from '@core/ui/vault/send/allowDeath/useSyncAllowDeathAmount'
import { useSpendableSendAmount } from '@core/ui/vault/send/amount/useSpendableSendAmount'
import { useSendFeeEstimateQuery } from '@core/ui/vault/send/queries/useSendFeeEstimateQuery'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import { RefreshSend } from '@core/ui/vault/send/RefreshSend'
import { useSendAmount } from '@core/ui/vault/send/state/amount'
import { Button, buttonHeight } from '@lib/ui/buttons/Button'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSendAssetFilter } from '../state/assetFilter'
import { useSendFormFieldState } from '../state/formFields'
import { SendChainPicker } from '../steps/asset/SendChainPicker'
import { SendStepHeader } from '../steps/SendStepHeader'
import { SendStepPanes } from '../steps/SendStepPanes'
import { SendStepTitle } from '../steps/SendStepTitle'
import { useSendStepCompletion } from '../steps/useSendStepCompletion'

/**
 * The send form, one step at a time: asset, address, amount. Continue on the
 * amount step commits the amount Verify signs, reduced to what the balance
 * covers after the fee. It waits while the fee is re-estimated for a new
 * receiver or memo, so that reduction never uses the previous estimate.
 */
export const SendForm = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const [{ field: step }, setStep] = useSendFormFieldState()
  const [{ isPickingChain }] = useSendAssetFilter()
  const shouldReduceMotion = useReducedMotion() === true
  const completion = useSendStepCompletion()
  const { data, error, isPending } = useSendValidationQuery()
  const [amount, setAmount] = useSendAmount()
  const spendableAmount = useSpendableSendAmount()
  const isAllowDeathSyncing = useSyncAllowDeathAmount()
  const { isPlaceholderData: isFeeRefreshing } = useSendFeeEstimateQuery()

  // Commit a fee-driven adjustment only here, never while the field is being
  // typed into: rewriting the amount on every keystroke would fight the user
  // for the field. Verify reads the same state, so it shows — and signs — the
  // adjusted amount rather than the one that no longer fits.
  const submitAmount = () => {
    if (spendableAmount !== null && spendableAmount !== amount) {
      setAmount(spendableAmount)
    }

    onFinish()
  }

  const amountStepDisabled = (() => {
    if (data && !isRecordEmpty(data)) {
      return Object.values(data)[0]
    }

    if (error) {
      return extractErrorMsg(error)
    }

    return isPending || isAllowDeathSyncing || isFeeRefreshing
  })()

  const isDisabled = {
    coin: completion.coin ? false : t('select_asset'),
    address: !completion.address,
    amount: amountStepDisabled,
  }[step]

  const handleSubmit = {
    coin: () => setStep(prev => ({ ...prev, field: 'address' })),
    address: () => setStep(prev => ({ ...prev, field: 'amount' })),
    amount: submitAmount,
  }[step]

  const screenFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: shouldReduceMotion ? 0 : screenFadeDurationS },
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isPickingChain ? (
        <Screen key="chains" {...screenFade}>
          <SendChainPicker />
        </Screen>
      ) : (
        <Screen key="form" {...screenFade}>
          <PageHeader
            primaryControls={<PageHeaderBackButton />}
            secondaryControls={<RefreshSend />}
            title={t('send')}
            hasBorder
          />
          <Frame
            as="form"
            data-testid="send-form"
            {...getFormProps({
              onSubmit: handleSubmit,
              isDisabled,
            })}
          >
            <StepHeading gap={12}>
              <SendStepHeader />
              <SendStepTitle />
            </StepHeading>
            <ScrollArea>
              <SendStepPanes />
            </ScrollArea>
            <FloatingContinue>
              <Button
                disabled={isDisabled}
                loading={step === 'amount' && (isPending || isFeeRefreshing)}
                type="submit"
                data-testid="send-continue"
              >
                {t('continue')}
              </Button>
            </FloatingContinue>
          </Frame>
        </Screen>
      )}
    </AnimatePresence>
  )
}

const screenFadeDurationS = 0.15
const titleToScrollGapPx = 12
const scrollEdgeFadePx = 12
const continueGapPx = 16
const pageBottomInset = `var(${pageBottomInsetVar}, 0px) + env(safe-area-inset-bottom, 0px)`

const Screen = styled(motion.div)`
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
`

const Frame = styled(ActionForm)`
  position: relative;
  flex-basis: 0;
  min-height: 0;
  padding-bottom: 0;
`

const StepHeading = styled(VStack)`
  padding-top: 8px;
`

/** Runs under the floating Continue, padded so the last row clears it; the top edge fades. */
const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  margin-top: ${titleToScrollGapPx}px;
  margin-inline: -${pageConfig.horizontalPadding}px;
  padding-top: ${scrollEdgeFadePx}px;
  padding-bottom: calc(
    ${buttonHeight.md + continueGapPx * 2}px + ${pageBottomInset}
  );
  overflow-y: auto;
  ${hideScrollbars};
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black ${scrollEdgeFadePx}px
  );
`

const FloatingContinue = styled.div`
  position: absolute;
  inset-inline: ${pageConfig.horizontalPadding}px;
  bottom: calc(${continueGapPx}px + ${pageBottomInset});
`
