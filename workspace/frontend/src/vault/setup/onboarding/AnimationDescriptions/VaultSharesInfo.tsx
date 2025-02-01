import { useTranslation } from 'react-i18next';

import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../lib/ui/text';
import { TextWrapper } from './AnimationDescriptions.styled';

export const VaultSharesInfo = () => {
  const { t } = useTranslation();
  return (
    <AnimatedVisibility>
      <TextWrapper>
        <Text as="span" size={48}>
          {t('theyRe')}{' '}
          <GradientText as="span" size={48}>
            {t('splitIntoParts')}
          </GradientText>{' '}
          {t('toIncreaseSecurity')}{' '}
          <GradientText>{t('removeSinglePointOfFailure')}</GradientText>
        </Text>
      </TextWrapper>
    </AnimatedVisibility>
  );
};
