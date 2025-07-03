import {
  ContentWrapper,
  IconWrapper,
  PillWrapper,
  SummaryListItem,
  Wrapper,
} from '@core/ui/onboarding/components/OnboardingSummary/OnboardingSummary.styles'
import { Button } from '@lib/ui/buttons/Button'
import { CloudDownloadIcon } from '@lib/ui/icons/CloudDownloadIcon'
import { LayersIcon } from '@lib/ui/icons/LayersIcon'
import { SplitIcon } from '@lib/ui/icons/SplitIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Overlay } from './ReferralSummary.styles'

const StyledIcon = styled(TriangleAlertIcon)`
  color: ${getColor('idle')};
`

export const ReferralsSummary = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  const items = [
    {
      title: 'Create your referral code',
      description: 'Pick a short code and set your reward payout.',
      icon: <CloudDownloadIcon fontSize={24} />,
    },
    {
      title: 'Share with friends',
      description: 'Invite friends to use your code while swapping.',
      icon: <SplitIcon fontSize={24} />,
    },
    {
      title: 'Earn rewards automatically',
      description: 'Get paid in your preferred asset every time they trade.',
      icon: <LayersIcon fontSize={24} />,
    },
    {
      title: 'Use Referral code',
      description: 'Use a code from your friend and save on swap fees.',
      icon: <StyledIcon fontSize={24} />,
    },
  ]

  return (
    <>
      <VStack fullHeight>
        <AnimatedVisibility
          animationConfig="bottomToTop"
          config={{ duration: 1000 }}
          delay={300}
          overlayStyles={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Wrapper
            justifyContent="space-between"
            flexGrow
            data-testid="OnboardingSummary-Wrapper"
          >
            <VStack gap={46}>
              <PillWrapper data-testid="OnboardingSummary-PillWrapper">
                <Text size={12} color="shy">
                  Referral Program
                </Text>
              </PillWrapper>
              <ContentWrapper>
                <Text variant="h1Regular">
                  {t('fastVaultSetup.summary.title')}
                </Text>
                <VStack gap={24}>
                  {items.map(({ title, icon }) => (
                    <SummaryListItem alignItems="center" key={title}>
                      <IconWrapper>{icon}</IconWrapper>
                      <Text color="contrast" weight={500} size={13}>
                        {title}
                      </Text>
                    </SummaryListItem>
                  ))}
                </VStack>
              </ContentWrapper>
            </VStack>

            <Button onClick={onFinish}>
              {t('fastVaultSetup.summary.ctaText')}
            </Button>
          </Wrapper>
        </AnimatedVisibility>
      </VStack>
      <Overlay />
    </>
  )
}
