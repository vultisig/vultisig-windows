import { Button } from '@lib/ui/buttons/Button'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { OnForwardProp } from '@lib/ui/props'
import { t } from 'i18next'
import { FC } from 'react'
import styled from 'styled-components'

import { getFormProps } from '../../../lib/ui/form/utils/getFormProps'
import { PageContent } from '../../../ui/page/PageContent'
import { useIsSwapFormDisabled } from './hooks/useIsSwapFormDisabled'
import { SwapInfo } from './info/SwapInfo'
import { ManageFromCoin } from './ManageFromCoin'
import { ManageToCoin } from './ManageToCoin'
import { ReverseSwap } from './ReverseSwap'

export const SwapForm: FC<OnForwardProp> = ({ onForward }) => {
  const isDisabled = useIsSwapFormDisabled()

  return (
    <PageContent
      as="form"
      gap={40}
      {...getFormProps({
        onSubmit: onForward,
        isDisabled,
      })}
      justifyContent="space-between"
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
      <Button
        isDisabled={isDisabled}
        disabled={Boolean(isDisabled)}
        type="submit"
      >
        {typeof isDisabled === 'string' ? isDisabled : t('continue')}
      </Button>
    </PageContent>
  )
}

const ReverseSwapWrapper = styled.div`
  ${vStack({ gap: 8 })}
  position: relative;
`
