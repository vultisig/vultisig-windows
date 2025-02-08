import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AnimatedVisibility } from '../../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../../lib/ui/text';
import { useVaultShares } from '../state/VaultSharesProvider';
import { BACKUP_VAULT_ANIMATIONS } from './hooks/useBackupOverviewStepsAnimations';

type AnimationDescriptionProps = {
  animation: (typeof BACKUP_VAULT_ANIMATIONS)[number];
};
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => {
  const { t } = useTranslation();
  const vaultSharesNumber = useVaultShares().length;

  const stepToAnimationDescription = [
    () => (
      <Text size={48}>
        {t('secureVaultSetup.backup.shares', {
          shares: vaultSharesNumber,
        })}{' '}
        <GradientText as="span">
          {t('secureVaultSetup.backup.eachDeviceNeedsBackup')}
        </GradientText>
      </Text>
    ),
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
