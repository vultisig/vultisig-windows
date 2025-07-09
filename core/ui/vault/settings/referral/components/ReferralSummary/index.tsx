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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  ContentWrapper,
  IconWrapper,
  PillWrapper,
  SummaryListItem,
  Wrapper,
} from './ReferralSummary.styled'
import { Overlay } from './ReferralSummary.styled'

const StyledIconWrapper = styled(IconWrapper)`
  color: ${getColor('primaryAlt')};
`

const items = [
  {
    title: 'referrals_summary.item_1.title' as const,
    description: 'referrals_summary.item_1.description' as const,
    icon: <TextCursorInputIcon />,
  },
  {
    title: 'referrals_summary.item_2.title' as const,
    description: 'referrals_summary.item_2.description' as const,
    icon: <ShareTwoIcon />,
  },
  {
    title: 'referrals_summary.item_3.title' as const,
    description: 'referrals_summary.item_3.description' as const,
    icon: <TrophyIcon />,
  },
  {
    title: 'referrals_summary.item_4.title' as const,
    description: 'referrals_summary.item_4.description' as const,
    icon: <UserCheckIcon />,
  },
]

export const ReferralsSummary = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

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
                  {t('referral_program')}
                </Text>
              </PillWrapper>
              <ContentWrapper>
                <Text variant="h1Regular">{t('how_it_works')}</Text>
                <VStack gap={24}>
                  {items.map(({ title, icon, description }) => (
                    <SummaryListItem alignItems="center" key={title}>
                      <StyledIconWrapper>{icon}</StyledIconWrapper>
                      <VStack gap={4}>
                        <Text color="contrast" weight={500} size={13}>
                          {t(title)}
                        </Text>
                        <Text color="shy" weight={500} size={13}>
                          {t(description)}
                        </Text>
                      </VStack>
                    </SummaryListItem>
                  ))}
                </VStack>
              </ContentWrapper>
            </VStack>
            <Button onClick={onFinish}>{t('get_started')}</Button>
          </Wrapper>
        </AnimatedVisibility>
      </VStack>
      <Overlay />
    </>
  )
}
