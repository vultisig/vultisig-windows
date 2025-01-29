import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../lib/ui/text';
import { TextWrapper } from './AnimationDescriptions.styled';

export const VaultDevice = () => {
  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={48}>
          <GradientText as="span">Each device</GradientText> in your vault holds{' '}
          <GradientText as="span">one vault share</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  );
};
