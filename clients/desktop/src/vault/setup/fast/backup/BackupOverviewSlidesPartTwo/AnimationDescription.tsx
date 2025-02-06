import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AnimatedVisibility } from '../../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../../lib/ui/text';
import { BACKUP_VAULT_ANIMATIONS } from './hooks/useBackupOverviewStepsAnimationsPartTwo';

type AnimationDescriptionProps = {
  animation: (typeof BACKUP_VAULT_ANIMATIONS)[number];
};
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => {
  const { t } = useTranslation();
  const stepToAnimationDescription = [
    () => <Text size={48}>Placeholder (missing animation)</Text>,
    () => <Text size={48}>Placeholder (missing animation)</Text>,
    () => (
      <Text size={48}>
        {t('fastVaultSetup.backup.backUp')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.thisVault')}
        </GradientText>{' '}
        {t('fastVaultSetup.backup.shareSecurely')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.shareOnlineBackup')}
        </GradientText>
      </Text>
    ),
  ];

  return (
    <Wrapper>
      <AnimatedVisibility>
        <TextWrapper>{stepToAnimationDescription[animation - 1]()}</TextWrapper>
      </AnimatedVisibility>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 144px;
`;

export const TextWrapper = styled.div`
  margin-inline: auto;
  max-width: 1200px;
  text-align: center;
`;
