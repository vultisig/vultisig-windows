import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AnimatedVisibility } from '../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../lib/ui/text';

type OnboardingGreetingProps = {
  onNextStep: () => void;
};

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
`;

export const OnboardingGreeting: FC<OnboardingGreetingProps> = ({
  onNextStep,
}) => {
  const { t } = useTranslation();
  return (
    <Wrapper data-testid="OnboardingGreeting-Wrapper">
      <AnimatedVisibility
        config={{
          duration: 1000,
        }}
        animationConfig="bottomToTop"
        delay={300}
        onAnimationComplete={() => {
          setTimeout(() => onNextStep(), 1000);
        }}
      >
        <Text variant="h1Regular">
          {t('sayGoodbyeTo')}{' '}
          <GradientText as="span">{t('seedPhrases')}</GradientText>
        </Text>
      </AnimatedVisibility>
    </Wrapper>
  );
};
