import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AnimatedVisibility } from '../../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../../lib/ui/text';

export const AnimationDescription = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <AnimatedVisibility>
        <TextWrapper>
          <Text size={48}>
            {t('fastVaultSetup.backup.backUp')}{' '}
            <GradientText as="span">
              {t('fastVaultSetup.backup.this_vault')}
            </GradientText>{' '}
            {t('fastVaultSetup.backup.securely')}{' '}
            <GradientText as="span">
              {t('fastVaultSetup.backup.shareOnlineBackup')}
            </GradientText>
          </Text>
        </TextWrapper>
      </AnimatedVisibility>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-height: 144px;
  max-width: 500px;
  margin-inline: auto;
`;

export const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 1200px;
  text-align: center;
`;
