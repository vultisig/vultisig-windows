import { match } from '@lib/utils/match'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { HStack, VStack } from '../../../lib/ui/layout/Stack'
import { Text } from '../../../lib/ui/text'
import { PageContent } from '../../../ui/page/PageContent'
import {
  ServerAnimationStates,
  useQueryAnimations,
} from '../hooks/useQueryAnimations'

type WaitForServerStatesProps = {
  state: ServerAnimationStates
  onAnimationEnd?: () => void
}

export const WaitForServerStates: FC<WaitForServerStatesProps> = ({
  state,
  onAnimationEnd,
}) => {
  const { t } = useTranslation()
  const RiveComponent = useQueryAnimations({
    onAnimationEnd,
    state,
  })

  return (
    <PageContent alignItems="center" justifyContent="center" gap={24}>
      <ContentWrapper justifyContent="center" alignItems="center" gap={24}>
        <LoaderWrapper alignItems="center" justifyContent="center">
          <RiveComponent />
        </LoaderWrapper>
        <VStack gap={8} alignItems="center">
          <Text
            centerHorizontally
            variant="h1Regular"
            size={32}
            color="contrast"
          >
            {match(state, {
              success: () => t('fastVaultSetup.connectionSuccess'),
              pending: () => t('fastVaultSetup.connectingWithServer'),
              error: () => t('serverTimedOut'),
            })}
          </Text>
          <Text centerHorizontally size={14} color="shy">
            {match(state, {
              success: () => t('fastVaultSetup.vaultInitializationStarting'),
              pending: () => t('fastVaultSetup.takeMinute'),
              error: () => t('serverTookTooLong'),
            })}
          </Text>
        </VStack>
      </ContentWrapper>
    </PageContent>
  )
}

const ContentWrapper = styled(VStack)`
  position: relative;
  width: 360px;
  height: 360px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      82deg,
      rgba(51, 230, 191, 0.15) 8.02%,
      rgba(4, 57, 199, 0.15) 133.75%
    );
    filter: blur(50px);
    opacity: 0.5;
    border-radius: 360px;
    z-index: -1;
  }
`

const LoaderWrapper = styled(HStack)`
  width: 48px;
  height: 48px;
`
