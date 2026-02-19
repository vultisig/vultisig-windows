import { getOnboardingV3AnimationPath } from '@core/ui/onboarding/animations/onboardingV3AnimationSources'
import { onboardingSuccessAnimationSource } from '@core/ui/onboarding/animations/onboardingV3AnimationSources'
import { Animation } from '@lib/ui/animations/Animation'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

const animationDuration = 6000

export const KeygenFlowSuccess = () => {
  const { t } = useTranslation()

  const navigate = useCoreNavigate()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate({ id: 'vault' })
    }, animationDuration)

    return () => clearTimeout(timeoutId)
  }, [navigate])

  return (
    <Wrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper justifyContent="center">
          <Animation
            src={getOnboardingV3AnimationPath(onboardingSuccessAnimationSource)}
          />
        </RiveWrapper>
        <VStack alignItems="center" gap={12}>
          <Text centerHorizontally size={32}>
            <GradientText>{t('fastVaultSetup.backup.wellDone')}</GradientText>{' '}
            {t('fastVaultSetup.backup.setNewStandard')}
          </Text>
          <Spinner size="3em" />
        </VStack>
      </VStack>
    </Wrapper>
  )
}

const RiveWrapper = styled(VStack)`
  position: relative;
  flex: 1;
`

const Wrapper = styled(PageContent)`
  margin-inline: auto;
  max-width: 800px;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    margin-top: 48px;
  }
`
