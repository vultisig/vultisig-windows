import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CloudStackIcon } from '@lib/ui/icons/CloudStackIcon'
import { CloudWithToolkeyIcon } from '@lib/ui/icons/CloudWithToolkeyIcon'
import { TriangleExclamationIcon } from '@lib/ui/icons/TriangleExclamationIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility'
import { useHasFinishedOnboarding } from '../../../../onboarding/hooks/useHasFinishedOnboarding'
import {
  ContentWrapper,
  IconWrapper,
  PillWrapper,
  StyledCheckbox,
  SummaryListItem,
  Wrapper,
} from './OnboardingSummary.styles'

export const OnboardingSummary = () => {
  const { t } = useTranslation()
  const [, setHasFinishedOnboarding] = useHasFinishedOnboarding()
  const [isChecked, { toggle }] = useBoolean(false)

  const items = [
    {
      title: t('fastVaultSetup.summary.summaryItemOneTitle'),
      icon: <CloudWithToolkeyIcon />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemTwoTitle'),
      icon: <ArrowSplitIcon />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemThreeTitle'),
      icon: <CloudStackIcon />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemFourTitle'),
      icon: (
        <div style={{ fontSize: 24 }}>
          <TriangleExclamationIcon />
        </div>
      ),
    },
  ]

  return (
    <AnimatedVisibility
      config={{
        duration: 1000,
      }}
      animationConfig="bottomToTop"
      delay={300}
    >
      <Wrapper data-testid="OnboardingSummary-Wrapper">
        <PillWrapper data-testid="OnboardingSummary-PillWrapper">
          <Text size={12} color="shy">
            {t('fastVaultSetup.summary.pillText')}
          </Text>
        </PillWrapper>
        <ContentWrapper>
          <Text variant="h1Regular">{t('fastVaultSetup.summary.title')}</Text>
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
        <VStack gap={16}>
          <HStack
            role="button"
            tabIndex={0}
            onClick={toggle}
            alignItems="center"
            gap={8}
          >
            <StyledCheckbox value={isChecked} onChange={() => {}} />
            <Text color="contrast" weight={500} size={14}>
              {t('fastVaultSetup.summary.agreementText')}
            </Text>
          </HStack>
          <Button
            isDisabled={!isChecked}
            onClick={() => setHasFinishedOnboarding(true)}
          >
            {t('fastVaultSetup.summary.ctaText')}
          </Button>
        </VStack>
      </Wrapper>
    </AnimatedVisibility>
  )
}
