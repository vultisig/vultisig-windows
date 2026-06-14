import { SwapInfo } from '@core/ui/vault/swap/form/info/SwapInfo'
import { ManageFromCoin } from '@core/ui/vault/swap/form/ManageFromCoin'
import { ManageToCoin } from '@core/ui/vault/swap/form/ManageToCoin'
import { ReverseSwap } from '@core/ui/vault/swap/form/ReverseSwap'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapError, SwapErrorCode } from '@vultisig/core-chain/swap/SwapError'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { FC, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useSwapValidationQuery } from '../queries/useSwapValidationQuery'
import { AdvancedSwapSettings } from './advanced/AdvancedSwapSettings'

export const MarketSwapForm: FC<OnFinishProp<SwapQuote>> = ({ onFinish }) => {
  const {
    error,
    data: validationErrorMessage,
    isPending,
  } = useSwapValidationQuery()
  const swapQuoteQuery = useSwapQuoteQuery()
  const [{ autoSubmit }, setViewState] = useCoreViewState<'swap'>()
  const autoSubmittedRef = useRef(false)

  const { t } = useTranslation()

  // The SDK classifies a provider trading halt as a typed error, so key off the
  // code rather than string-matching the (English) message.
  const resolveErrorMessage = (err: unknown) =>
    err instanceof SwapError && err.code === SwapErrorCode.TradingHalted
      ? t('swap_trading_halted')
      : extractErrorMsg(err)

  const errorMessage = (() => {
    if (isPending) {
      return t('loading')
    }

    if (error) {
      return resolveErrorMessage(error)
    }

    if (validationErrorMessage === undefined) {
      return t('fill_the_form')
    }

    return validationErrorMessage
  })()

  useEffect(() => {
    if (
      autoSubmit &&
      !autoSubmittedRef.current &&
      !errorMessage &&
      !swapQuoteQuery.isPlaceholderData &&
      swapQuoteQuery.data
    ) {
      autoSubmittedRef.current = true
      setViewState(prev => ({ ...prev, autoSubmit: undefined }))
      onFinish(swapQuoteQuery.data)
    }
  }, [
    autoSubmit,
    errorMessage,
    swapQuoteQuery.data,
    swapQuoteQuery.isPlaceholderData,
    onFinish,
    setViewState,
  ])

  // Display error for ReverseSwap button (excludes non-error states like loading/fill_the_form)
  const displayErrorMessage = (() => {
    if (isPending) return null
    if (error) return resolveErrorMessage(error)
    if (validationErrorMessage === undefined) return null
    return validationErrorMessage
  })()

  const handleSubmit = () => {
    if (!errorMessage && !swapQuoteQuery.isPlaceholderData) {
      const swapQuote = shouldBePresent(swapQuoteQuery.data, 'swap quote')
      onFinish(swapQuote)
    }
  }

  return (
    <PageContent
      as="form"
      gap={40}
      data-testid="swap-form"
      {...getFormProps({
        onSubmit: handleSubmit,
        isDisabled: !!errorMessage,
      })}
      justifyContent="space-between"
      scrollable
    >
      <VStack gap={16}>
        <VStack gap={8}>
          <ManageFromCoin />
          <ReverseSwapWrapper>
            <ReverseSwap errorMessage={displayErrorMessage} />
          </ReverseSwapWrapper>
          <ManageToCoin />
        </VStack>
        <VStack gap={10}>
          <SwapInfo />
        </VStack>
      </VStack>
      <VStack gap={20}>
        <AdvancedSwapSettings />
        <Button
          disabled={!!errorMessage}
          type="submit"
          data-testid="swap-continue"
        >
          {t('continue')}
        </Button>
      </VStack>
    </PageContent>
  )
}

const ReverseSwapWrapper = styled.div`
  ${vStack({ gap: 8 })}
  position: relative;
`
