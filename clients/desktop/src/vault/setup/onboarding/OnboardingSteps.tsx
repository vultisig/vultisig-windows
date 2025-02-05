import { ComponentProps, FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { MultistepProgressIndicator } from '../../../lib/ui/flow/MultistepProgressIndicator';
import { ChevronLeftIcon } from '../../../lib/ui/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../../lib/ui/icons/ChevronRightIcon';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { PageContent } from '../../../ui/page/PageContent';
import { AnimationDescription } from './AnimationDescriptions';
import { useOnboardingStepsAnimations } from './hooks/useOnboardingStepsAnimations';
import { RiveWrapper } from './Onobarding.styled';

const NextAnimationButton = styled(IconButton)`
  flex-shrink: 0;
  width: 84px;
  height: 48px;
  border-radius: 99px;
  background-color: ${getColor('primary')};
  align-self: center;

  &:hover {
    background-color: ${getColor('primary')};
  }

  & svg {
    stroke: ${getColor('textDark')};
  }
`;

const ProgressWrapper = styled(VStack)`
  margin-inline: auto;
  margin-top: 48px;
`;

export type SharedOnboardingScreensProps = {
  animationComponent: (props: ComponentProps<'canvas'>) => JSX.Element;
  onNextAnimation: () => void;
};

type OnboardingStepsProps = {
  onCompleteSteps: () => void;
};

export const OnboardingSteps: FC<OnboardingStepsProps> = ({
  onCompleteSteps,
}) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const {
    animations,
    handleNextAnimation,
    currentAnimation,
    animationComponent: AnimationComponent,
    isLoading,
  } = useOnboardingStepsAnimations();

  return (
    <PageContent>
      <ProgressWrapper gap={16}>
        <HStack justifyContent="space-between" alignItems="baseline">
          <HStack
            as="button"
            alignItems="center"
            gap={4}
            onClick={() => navigate('setupVault', { params: {} })}
          >
            <IconButton icon={<ChevronLeftIcon width={24} height={24} />} />
            <Text size={18}>{t('introOnboarding')}</Text>
          </HStack>
          <UnstyledButton onClick={onCompleteSteps}>
            <Text color="shy" size={18}>
              {t('skip')}
            </Text>
          </UnstyledButton>
        </HStack>
        <MultistepProgressIndicator
          markPreviousStepsAsCompleted
          steps={6}
          stepWidth={`100px`}
          value={animations.indexOf(currentAnimation) + 1}
          variant="bars"
        />
      </ProgressWrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper>
          <AnimationComponent />
        </RiveWrapper>
        <VStack gap={12}>
          <AnimationDescription animation={currentAnimation} />
          <NextAnimationButton
            disabled={isLoading}
            icon={<ChevronRightIcon />}
            onClick={
              currentAnimation !== animations[animations.length - 1]
                ? handleNextAnimation
                : onCompleteSteps
            }
          >
            {t('tap')}
          </NextAnimationButton>
        </VStack>
      </VStack>
    </PageContent>
  );
};
