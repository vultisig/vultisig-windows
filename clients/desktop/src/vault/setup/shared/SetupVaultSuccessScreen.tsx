import { useRive } from '@rive-app/react-canvas';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { VStack } from '../../../lib/ui/layout/Stack';
import { OnForwardProp } from '../../../lib/ui/props';
import { GradientText, Text } from '../../../lib/ui/text';
import { AnimatedLoader } from '../../../ui/pending/AnimatedLoader';

const SETUP_VAULT_SUCCESS_SCREEN_TIME_IN_MS = 2500;
export const SetupVaultSuccessScreen = ({ onForward }: OnForwardProp) => {
  const { t } = useTranslation();
  const { RiveComponent } = useRive({
    src: '/assets/animations/vault-creation-success/vault_created.riv',
    autoplay: true,
  });

  useEffect(() => {
    const timeoutId = setTimeout(
      onForward,
      SETUP_VAULT_SUCCESS_SCREEN_TIME_IN_MS
    );

    return () => clearTimeout(timeoutId);
  }, [onForward]);

  return (
    <Wrapper justifyContent="center" alignItems="center">
      <VStack flexGrow justifyContent="center" gap={48}>
        <RiveWrapper>
          <RiveComponent />
        </RiveWrapper>
        <VStack alignItems="center" gap={8}>
          <Text centerHorizontally variant="h1Regular">
            {t('vaultCreated')} <GradientText>{t('successfully')}</GradientText>
          </Text>
          <AnimatedLoader />
        </VStack>
      </VStack>
    </Wrapper>
  );
};

const Wrapper = styled(VStack)`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const RiveWrapper = styled.div`
  width: 500px;
  height: 500px;
`;
