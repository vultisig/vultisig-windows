import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { PageContent } from '../../../ui/page/PageContent';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { AnimationDescription } from './AnimationDescriptions';
import { useOnboardingStepsAnimations } from './hooks/useOnboardingStepsAnimations';
import { RiveWrapper } from './Onobarding.styled';

export type SharedOnboardingScreensProps = {
  animationComponent: (props: ComponentProps<'canvas'>) => JSX.Element;
  onNextAnimation: () => void;
};

export const OnboardingSteps = () => {
  const { t } = useTranslation();
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
  } = useOnboardingStepsAnimations();

  const currentIndex = animations.indexOf(currentAnimation);
  const progressRaw = (currentIndex + 1) / animations.length;

  return (
    <PageContent>
      <WithProgressIndicator value={progressRaw}>
        <VStack flexGrow>
          <RiveWrapper>
            <AnimationComponent />
          </RiveWrapper>
          <AnimationDescription animation={currentAnimation} />
        </VStack>
        <button onClick={handleNextAnimation}>{t('tap')}</button>
      </WithProgressIndicator>
    </PageContent>
  );
};
