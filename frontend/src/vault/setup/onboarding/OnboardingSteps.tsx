import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { ChevronRightIcon } from '../../../lib/ui/icons/ChevronRightIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { getColor } from '../../../lib/ui/theme/getters';
import { PageContent } from '../../../ui/page/PageContent';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { AnimationDescription } from './AnimationDescriptions';
import { useOnboardingStepsAnimations } from './hooks/useOnboardingStepsAnimations';
import { RiveWrapper } from './Onobarding.styled';
import { useOnboardingCompletion } from './state/OnboardingCompletionProvider';

const NextAnimationButton = styled(IconButton)`
  flex-shrink: 0;
  width: 84px;
  height: 48px;
  border-radius: 99px;
  background-color: ${getColor('primary')};
  margin-top: 12px;
  align-self: center;

  &:hover {
    background-color: ${getColor('primary')};
  }

  & svg {
    stroke: ${getColor('textDark')};
  }
`;

export type SharedOnboardingScreensProps = {
  animationComponent: (props: ComponentProps<'canvas'>) => JSX.Element;
  onNextAnimation: () => void;
};

export const OnboardingSteps = () => {
  const [, setIsOnboarded] = useOnboardingCompletion();

  const { t } = useTranslation();
  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useOnboardingStepsAnimations();

  const currentIndex = animations.indexOf(currentAnimation);
  const progressRaw = (currentIndex + 1) / animations.length;
  const lastAnimation = animations[animations.length - 1];

  return (
    <PageContent>
      <WithProgressIndicator value={progressRaw}>
        <VStack flexGrow>
          <RiveWrapper>
            <AnimationComponent />
          </RiveWrapper>
          <AnimationDescription animation={currentAnimation} />
          <NextAnimationButton
            disabled={isLoading}
            icon={<ChevronRightIcon />}
            onClick={
              currentAnimation !== lastAnimation
                ? handleNextAnimation
                : () => setIsOnboarded(true)
            }
          >
            {t('tap')}
          </NextAnimationButton>
        </VStack>
      </WithProgressIndicator>
    </PageContent>
  );
};
