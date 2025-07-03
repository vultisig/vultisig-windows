import {
  ContentWrapper,
  IconWrapper,
  PillWrapper,
  StyledCheckbox,
  SummaryListItem,
  Wrapper,
} from '@core/ui/onboarding/components/OnboardingSummary/OnboardingSummary.styles'
import { useSetHasFinishedOnboardingMutation } from '@core/ui/storage/onboarding'
import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CloudDownloadIcon } from '@lib/ui/icons/CloudDownloadIcon'
import { LayersIcon } from '@lib/ui/icons/LayersIcon'
import { SplitIcon } from '@lib/ui/icons/SplitIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledIcon = styled(TriangleAlertIcon)`
  color: ${getColor('idle')};
`

export const OnboardingSummary = () => {
  const { t } = useTranslation()
  const { mutateAsync: setHasFinishedOnboarding } =
    useSetHasFinishedOnboardingMutation()
  const [isChecked, { toggle }] = useBoolean(false)

  const items = [
    {
      title: t('fastVaultSetup.summary.summaryItemOneTitle'),
      icon: <CloudDownloadIcon fontSize={24} />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemTwoTitle'),
      icon: <SplitIcon fontSize={24} />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemThreeTitle'),
      icon: <LayersIcon fontSize={24} />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemFourTitle'),
      icon: <StyledIcon fontSize={24} />,
    },
  ]

  return (
    <VStack fullHeight>
      <AnimatedVisibility
        animationConfig="bottomToTop"
        config={{ duration: 1000 }}
        delay={300}
      >
        <Wrapper flexGrow data-testid="OnboardingSummary-Wrapper">
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
              disabled={!isChecked}
              onClick={() => setHasFinishedOnboarding(true)}
            >
              {t('fastVaultSetup.summary.ctaText')}
            </Button>
          </VStack>
        </Wrapper>
      </AnimatedVisibility>
    </VStack>
  )
}
