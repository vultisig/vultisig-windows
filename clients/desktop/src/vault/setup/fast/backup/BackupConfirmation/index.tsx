import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { storage } from '../../../../../../wailsjs/go/models';
import { Button } from '../../../../../lib/ui/buttons/Button';
import { UnstyledButton } from '../../../../../lib/ui/buttons/UnstyledButton';
import DownloadIcon from '../../../../../lib/ui/icons/DownloadIcon';
import { VStack } from '../../../../../lib/ui/layout/Stack';
import { useInvalidateQueries } from '../../../../../lib/ui/query/hooks/useInvalidateQueries';
import { Text } from '../../../../../lib/ui/text';
import { PageContent } from '../../../../../ui/page/PageContent';
import { PageHeader } from '../../../../../ui/page/PageHeader';
import { AnimatedLoader } from '../../../../../ui/pending/AnimatedLoader';
import { useBackupVaultMutation } from '../../../../mutations/useBackupVaultMutation';
import { vaultsQueryKey } from '../../../../queries/useVaultsQuery';

export const steps = [
  'multiFactor',
  'selfCustodial',
  'crossChain',
  'over30Chains',
  'availablePlatforms',
  'seedlessWallet',
] as const;

export type SetupFastVaultEducationSlidesStep = (typeof steps)[number];

const Wrapper = styled(VStack)`
  max-width: 500px;
  align-self: center;
`;

const Content = styled(VStack)`
  flex: 1;
`;

const MissingRiveAnimationPlaceholder = styled(VStack)`
  flex: 1;
  background-color: purple;
  width: 100%;
`;

type BackupConfirmationProps = {
  vault: storage.Vault;
  onCompleted: () => void;
};

export const BackupConfirmation: FC<BackupConfirmationProps> = ({
  vault,
  onCompleted,
}) => {
  const { t } = useTranslation();
  const invalidateQueries = useInvalidateQueries();
  const { mutate: backupVault, isPending, error } = useBackupVaultMutation();

  const handleBackup = async () => {
    if (!vault) return;

    backupVault(
      { vault, password: '' },
      {
        onSuccess: () => {
          onCompleted();
          invalidateQueries(vaultsQueryKey);
        },
      }
    );
  };

  return (
    <PageContent>
      <PageHeader
        title={
          <Text size={16} weight={500}>
            {t('fastVaultSetup.backup.backupVault')}
          </Text>
        }
      />
      <Wrapper
        flexGrow
        alignItems="center"
        justifyContent="space-between"
        gap={48}
      >
        <Content alignItems="center" justifyContent="space-between" gap={40}>
          <MissingRiveAnimationPlaceholder
            alignItems="center"
            justifyContent="center"
          >
            Placeholder (Missing Rive Animation Component)
          </MissingRiveAnimationPlaceholder>
          <VStack gap={16}>
            <Text centerHorizontally variant="h1Regular">
              {t('fastVaultSetup.backup.backupConfirmationDescription')}
            </Text>
            <Text centerHorizontally color="shy" size={14}>
              {t('fastVaultSetup.backup.onlineStorageDescription')}{' '}
              <UnstyledButton
                onClick={() => {
                  // TODO: Tony to add learn more link when available
                }}
              >
                <Text centerHorizontally color="supporting" as="span">
                  {t('learnMore')}
                </Text>
              </UnstyledButton>
            </Text>
          </VStack>
        </Content>
        {isPending ? (
          <LoaderWrapper>
            <AnimatedLoader />
          </LoaderWrapper>
        ) : (
          <VStack gap={4}>
            <BackupButton onClick={handleBackup} size="m">
              <DownloadIcon />
              <Text as="span" size={14}>
                {t('fastVaultSetup.backup.backUpNow')}
              </Text>
            </BackupButton>
            {error && (
              <Text size={12} color="danger">
                {error.message}
              </Text>
            )}
          </VStack>
        )}
      </Wrapper>
    </PageContent>
  );
};

const BackupButton = styled(Button)`
  font-size: 20px;
  gap: 8px;
`;

const LoaderWrapper = styled(VStack)`
  height: 24px;
  width: 24px;
`;
