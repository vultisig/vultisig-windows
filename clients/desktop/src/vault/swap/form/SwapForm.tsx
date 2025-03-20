import { OnForwardProp } from '@lib/ui/props'
import { t } from 'i18next'
import { FC } from 'react'
import styled from 'styled-components'

import { Button } from '../../../lib/ui/buttons/Button'
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps'
import { VStack, vStack } from '../../../lib/ui/layout/Stack'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { RefreshSwap } from '../components/RefreshSwap'
import { useIsSwapFormDisabled } from './hooks/useIsSwapFormDisabled'
import { SwapInfo } from './info/SwapInfo'
import { ManageFromCoin } from './ManageFromCoin'
import { ManageToCoin } from './ManageToCoin'
import { ReverseSwap } from './ReverseSwap'

export const SwapForm: FC<OnForwardProp> = ({ onForward }) => {
  const isDisabled = useIsSwapFormDisabled()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSwap />}
        title={<PageHeaderTitle>{t('swap')}</PageHeaderTitle>}
      />
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
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
    </>
  )
}

const ReverseSwapWrapper = styled.div`
  ${vStack({ gap: 8 })}
  position: relative;
`
