import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../lib/ui/text';
import { TextWrapper } from './AnimationDescriptions.styled';

export const VaultSharesInfo = () => {
  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={48}>
          They’re{' '}
          <GradientText as="span" size={48}>
            split into parts
          </GradientText>{' '}
          to increase security and{' '}
          <GradientText>remove single point-of-failure</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  );
};
