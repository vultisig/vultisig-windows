import { useTranslation } from 'react-i18next';

import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../lib/ui/text';
import { TextWrapper } from './AnimationDescriptions.styled';

export const VaultBackup = () => {
  const { t } = useTranslation();

  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" variant="h1Regular">
          {t('recoverYourVault')}{' '}
        </Text>
        <GradientText as="span" variant="h1Regular">
          {t('deviceLostOrDamaged')}
        </GradientText>
      </TextWrapper>
    </AnimatedVisibility>
  );
};
