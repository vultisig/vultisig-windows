import { SwapInfo } from '@core/ui/vault/swap/form/info/SwapInfo'
import { ManageFromCoin } from '@core/ui/vault/swap/form/ManageFromCoin'
import { ManageToCoin } from '@core/ui/vault/swap/form/ManageToCoin'
import { ReverseSwap } from '@core/ui/vault/swap/form/ReverseSwap'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSwapFormStates } from './hooks/useSwapFormStates'

export const SwapForm: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const { isDisabled } = useSwapFormStates()

  return (
    <>
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onFinish,
          isDisabled,
        })}
        justifyContent="space-between"
        scrollable
      >
        <VStack gap={16}>
          <VStack gap={8}>
            <ManageFromCoin />
            <ReverseSwapWrapper>
              <ReverseSwap />
            </ReverseSwapWrapper>
            <ManageToCoin />
          </VStack>
          <VStack gap={10}>
            <SwapInfo />
          </VStack>
        </VStack>
        <Button disabled={isDisabled} type="submit">
          {typeof isDisabled === 'string' ? isDisabled : t('continue')}
        </Button>
      </PageContent>
    </>
  )
}

const ReverseSwapWrapper = styled.div`
  ${vStack({ gap: 8 })}
  position: relative;
`
