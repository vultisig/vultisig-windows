import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';

const ContentWrapper = styled(VStack)`
  position: relative;
  width: 360px;
  height: 360px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      82deg,
      rgba(51, 230, 191, 0.15) 8.02%,
      rgba(4, 57, 199, 0.15) 133.75%
    );
    filter: blur(50px);
    opacity: 0.5;
    border-radius: 360px;
    z-index: -1;
  }
`;

const LoaderWrapper = styled(HStack)`
  width: 48px;
  height: 48px;
`;

type WaitForServerStatesProps = {
  state: 'success' | 'pending';
  onForward?: () => void;
};

const WaitForServerStatesRaw: FC<WaitForServerStatesProps> = ({
  state,
  onForward,
}) => {
  const { t } = useTranslation();
  const { RiveComponent, rive } = useRive({
    src: '/rive-animations/fast-vault-keygen.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    onStop: () => {
      onForward?.();
    },
  });

  const input = useStateMachineInput(rive, 'State Machine 1', 'Connected');

  useEffect(() => {
    if (rive && state === 'success') {
      input?.fire();
    }
  }, [rive, input, state, onForward]);

  return (
    <PageContent alignItems="center" justifyContent="center" gap={24}>
      <ContentWrapper justifyContent="center" alignItems="center" gap={24}>
        <LoaderWrapper alignItems="center" justifyContent="center">
          <RiveComponent />
        </LoaderWrapper>
        <VStack gap={8} alignItems="center">
          <Text variant="h1Regular" size={32} color="contrast">
            {state === 'pending'
              ? t('fastVaultSetup.connectingWithServer')
              : t('fastVaultSetup.connectionSuccess')}
          </Text>
          <Text size={14} color="shy">
            {state === 'pending'
              ? t('fastVaultSetup.takeMinute')
              : t('fastVaultSetup.vaultInitializationStarting')}
          </Text>
        </VStack>
      </ContentWrapper>
    </PageContent>
  );
};

export const WaitForServerStates = React.memo(WaitForServerStatesRaw);
