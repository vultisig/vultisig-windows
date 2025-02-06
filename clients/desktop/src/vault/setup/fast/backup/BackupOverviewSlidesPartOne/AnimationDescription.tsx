import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AnimatedVisibility } from '../../../../../lib/ui/layout/AnimatedVisibility';
import { GradientText, Text } from '../../../../../lib/ui/text';
import { BACKUP_VAULT_ANIMATIONS } from './hooks/useBackupOverviewStepsAnimations';

type AnimationDescriptionProps = {
  animation: (typeof BACKUP_VAULT_ANIMATIONS)[number];
};
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => {
  const { t } = useTranslation();
  const stepToAnimationDescription = {
    1: () => (
      <Text size={48}>
        {t('fastVaultSetup.backup.vaultShares')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.backUpNow')}
        </GradientText>
      </Text>
    ),
    2: () => (
      <Text size={48}>
        {t('fastVaultSetup.backup.part1')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.heldByServer')}
        </GradientText>
        .
      </Text>
    ),
    3: () => (
      <Text size={48}>
        {t('fastVaultSetup.backup.completeCustody')}{' '}
        <GradientText as="span">
          {t('fastVaultSetup.backup.checkEmail')}
        </GradientText>
      </Text>
    ),
  };

  return (
    <Wrapper>
      <AnimatedVisibility>
        <TextWrapper>{stepToAnimationDescription[animation]()}</TextWrapper>
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
