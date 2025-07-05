import { Button } from '@lib/ui/buttons/Button'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { ShareTwoIcon } from '@lib/ui/icons/ShareTwoIcon'
import { TextCursorInputIcon } from '@lib/ui/icons/TextCursorInputIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { UserCheckIcon } from '@lib/ui/icons/UserCheckIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import {
  ContentWrapper,
  IconWrapper,
  PillWrapper,
  SummaryListItem,
  Wrapper,
} from './ReferralSummary.styles'
import { Overlay } from './ReferralSummary.styles'

const StyledIconWrapper = styled(IconWrapper)`
  color: ${getColor('primaryAlt')};
`

export const ReferralsSummary = ({ onFinish }: OnFinishProp) => {
  const items = [
    {
      title: 'Create your referral code',
      description: 'Pick a short code and set your reward payout.',
      icon: <TextCursorInputIcon />,
    },
    {
      title: 'Share with friends',
      description: 'Invite friends to use your code while swapping.',
      icon: <ShareTwoIcon />,
    },
    {
      title: 'Earn rewards automatically',
      description: 'Get paid in your preferred asset every time they trade.',
      icon: <TrophyIcon />,
    },
    {
      title: 'Use Referral code',
      description: 'Use a code from your friend and save on swap fees.',
      icon: <UserCheckIcon />,
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
              <PillWrapper
                alignItems="center"
                data-testid="OnboardingSummary-PillWrapper"
              >
                <IconWrapper
                  style={{
                    fontSize: 16,
                    color: '#5CA7FF',
                  }}
                >
                  <MegaphoneIcon />
                </IconWrapper>
                <Text size={12} color="shy">
                  Referral Program
                </Text>
              </PillWrapper>
              <ContentWrapper>
                <Text variant="h1Regular">How it works</Text>
                <VStack gap={24}>
                  {items.map(({ title, icon, description }) => (
                    <SummaryListItem alignItems="center" key={title}>
                      <StyledIconWrapper>{icon}</StyledIconWrapper>
                      <VStack gap={4}>
                        <Text color="contrast" weight={500} size={13}>
                          {title}
                        </Text>
                        <Text color="shy" weight={500} size={13}>
                          {description}
                        </Text>
                      </VStack>
                    </SummaryListItem>
                  ))}
                </VStack>
              </ContentWrapper>
            </VStack>

            <Button onClick={onFinish}>Get Started</Button>
          </Wrapper>
        </AnimatedVisibility>
      </VStack>
      <Overlay />
    </>
  )
}
