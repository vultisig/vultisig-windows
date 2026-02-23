import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { SwapInfo } from '@core/ui/vault/swap/form/info/SwapInfo'
import { ManageFromCoin } from '@core/ui/vault/swap/form/ManageFromCoin'
import { ManageToCoin } from '@core/ui/vault/swap/form/ManageToCoin'
import { ReverseSwap } from '@core/ui/vault/swap/form/ReverseSwap'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { FC, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { RefreshSwap } from '../components/RefreshSwap'
import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useSwapValidationQuery } from '../queries/useSwapValidationQuery'

export const SwapForm: FC<OnFinishProp<SwapQuote>> = ({ onFinish }) => {
  const {
    error,
    data: validationErrorMessage,
    isPending,
  } = useSwapValidationQuery()
  const swapQuoteQuery = useSwapQuoteQuery()
  const [{ autoSubmit }, setViewState] = useCoreViewState<'swap'>()
  const autoSubmittedRef = useRef(false)

  const { t } = useTranslation()

  const errorMessage = useMemo(() => {
    if (isPending) {
      return t('loading')
    }

    if (error) {
      return extractErrorMsg(error)
    }

    if (validationErrorMessage === undefined) {
      return t('fill_the_form')
    }

    return validationErrorMessage
  }, [validationErrorMessage, error, isPending, t])

  useEffect(() => {
    if (
      autoSubmit &&
      !autoSubmittedRef.current &&
      !errorMessage &&
      swapQuoteQuery.data
    ) {
      autoSubmittedRef.current = true
      setViewState(prev => ({ ...prev, autoSubmit: undefined }))
      onFinish(swapQuoteQuery.data)
    }
  }, [autoSubmit, errorMessage, swapQuoteQuery.data, onFinish, setViewState])

  // Display error for ReverseSwap button (excludes non-error states like loading/fill_the_form)
  const displayErrorMessage = useMemo(() => {
    if (isPending) return null
    if (validationErrorMessage === undefined) return null
    if (error) return extractErrorMsg(error)
    return validationErrorMessage
  }, [validationErrorMessage, error, isPending])

  const handleSubmit = () => {
    if (!errorMessage) {
      const swapQuote = shouldBePresent(swapQuoteQuery.data, 'swap quote')
      onFinish(swapQuote)
    }
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSwap />}
        title={t('swap')}
        hasBorder
      />
      <PageContent
        as="form"
        gap={40}
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
        <Button disabled={!!errorMessage} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </>
  )
}

const ReverseSwapWrapper = styled.div`
  ${vStack({ gap: 8 })}
  position: relative;
`
