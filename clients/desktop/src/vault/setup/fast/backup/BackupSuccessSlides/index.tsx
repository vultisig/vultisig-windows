import { useRive } from '@rive-app/react-canvas';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { HStack, VStack } from '../../../../../lib/ui/layout/Stack';
import { GradientText, Text } from '../../../../../lib/ui/text';
import { PageContent } from '../../../../../ui/page/PageContent';
import { AnimatedLoader } from '../../../../../ui/pending/AnimatedLoader';

const BACKUP_SUCCESS_WAIT_TIME_IN_MS = 6000;

type BackupSuccessSlideProps = {
  onCompleted: () => void;
};

export const BackupSuccessSlide: FC<BackupSuccessSlideProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation();
  // TODO: @antonio to adjust animations when they're handed over by designer
  const { RiveComponent } = useRive({
    src: '/rive-animations/backup-screen-fast-vault-part-3.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  useEffect(() => {
    const timeoutId = setTimeout(onCompleted, BACKUP_SUCCESS_WAIT_TIME_IN_MS);
    return () => clearTimeout(timeoutId);
  }, [onCompleted]);

  return (
    <Wrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper justifyContent="center">
          <RiveComponent />
        </RiveWrapper>
        <VStack alignItems="center" gap={12}>
          <Text centerHorizontally variant="h1Regular">
            <GradientText>{t('fastVaultSetup.backup.wellDone')}</GradientText>{' '}
            {t('fastVaultSetup.backup.setNewStandard')}
          </Text>
          <LoaderWrapper>
            <AnimatedLoader />
          </LoaderWrapper>
        </VStack>
      </VStack>
    </Wrapper>
  );
};

const RiveWrapper = styled(HStack)`
  position: relative;
  flex: 1;
`;

const LoaderWrapper = styled.div`
  width: 48px;
  height: 48px;
`;

const Wrapper = styled(PageContent)`
  margin-top: 48px;
  margin-inline: auto;
  max-width: 800px;
`;
