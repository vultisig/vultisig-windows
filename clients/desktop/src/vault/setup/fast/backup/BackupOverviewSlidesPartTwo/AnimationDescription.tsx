import { FC } from 'react';
import styled from 'styled-components';

import { AnimatedVisibility } from '../../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../../lib/ui/text';
import { BACKUP_VAULT_ANIMATIONS } from './hooks/useBackupOverviewStepsAnimationsPartTwo';

const stepToAnimationDescription = {
  1: () => (
    <Text size={48}>
      Your vault holds 2 shares,{' '}
      <GradientText as="span">back them up now</GradientText>
    </Text>
  ),
  2: () => (
    <Text size={48}>
      Part 1 of the vault shares will be{' '}
      <GradientText as="span">held by the server</GradientText>.
    </Text>
  ),
  3: () => (
    <Text size={48}>
      It is sent to you for complete self-custody!{' '}
      <GradientText as="span">Check your e-mail to verify</GradientText>
    </Text>
  ),
};

type AnimationDescriptionProps = {
  animation: (typeof BACKUP_VAULT_ANIMATIONS)[number];
};
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => (
  <Wrapper>
    <AnimatedVisibility>
      <TextWrapper>{stepToAnimationDescription[animation]()}</TextWrapper>
    </AnimatedVisibility>
  </Wrapper>
);

const Wrapper = styled.div`
  height: 144px;
`;

export const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 1200px;
  text-align: center;
`;
