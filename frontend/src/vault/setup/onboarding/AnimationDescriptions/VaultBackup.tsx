import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../lib/ui/text';
import { TextWrapper } from './AnimationDescriptions.styled';

export const VaultBackup = () => {
  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={48}>
          <GradientText as="span">Always back up each vault share</GradientText>{' '}
          separately in a{' '}
          <GradientText as="span">different location</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  );
};
