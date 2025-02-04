import { useTranslation } from 'react-i18next';

import { Button } from '../../../../lib/ui/buttons/Button';
import { useBoolean } from '../../../../lib/ui/hooks/useBoolean';
import { Checkbox } from '../../../../lib/ui/inputs/checkbox/Checkbox';
import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility';
import { HStack, VStack } from '../../../../lib/ui/layout/Stack';
import { Text } from '../../../../lib/ui/text';
import { useHasFinishedOnboarding } from '../../../../onboarding/hooks/useHasFinishedOnboarding';
import { SUMMARY_ITEMS } from './constants';
import {
  ContentWrapper,
  IconWrapper,
  PillWrapper,
  SummaryListItem,
  Wrapper,
} from './OnboardingSummary.styles';

export const OnboardingSummary = () => {
  const { t } = useTranslation();
  const [, setHasFinishedOnboarding] = useHasFinishedOnboarding();
  const [isChecked, { toggle }] = useBoolean(false);

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
            {SUMMARY_ITEMS.map(({ title, icon: Icon }) => (
              <SummaryListItem alignItems="center" key={title}>
                <IconWrapper>
                  <Icon />
                </IconWrapper>
                <Text color="contrast" weight={500} size={13}>
                  {t(`fastVaultSetup.summary.${title}`)}
                </Text>
              </SummaryListItem>
            ))}
          </VStack>
        </ContentWrapper>
        <VStack gap={16}>
          <HStack alignItems="center" gap={8}>
            <Checkbox value={isChecked} onChange={toggle} />
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
  );
};
