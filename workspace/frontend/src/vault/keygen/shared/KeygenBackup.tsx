import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { storage } from '../../../../wailsjs/go/models';
import KeygenVaultBackupBanner from '../../../components/vaultBackupBanner/KeygenVaultBackupBanner/KeygenVaultBackupBanner';
import { Opener } from '../../../lib/ui/base/Opener';
import { Button } from '../../../lib/ui/buttons/Button';
import { ContainImage } from '../../../lib/ui/images/ContainImage';
import { SafeImage } from '../../../lib/ui/images/SafeImage';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text, text } from '../../../lib/ui/text';
import { makeAppPath } from '../../../navigation';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { ProductLogo } from '../../../ui/logo/ProductLogo';
import KeygenSkipVaultBackupAttentionModal from './KeygenSkipVaultBackupAttentionModal';

export const KeygenBackup = ({ vault }: { vault: storage.Vault }) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const isFastVault = vault.signers.some(signer =>
    signer.startsWith('Server-')
  );

  return (
    <Wrapper>
      <VStack gap={48} flexGrow alignItems="center" justifyContent="center">
        <HStack alignItems="center" gap={8}>
          <ProductLogo style={{ fontSize: 100 }} />
          <Text color="contrast" size={38} weight="600">
            {t('vultisig')}
          </Text>
        </HStack>
        <ArtContainer>
          <SafeImage
            src="/assets/images/backupNow.svg"
            render={props => <ContainImage {...props} />}
          />
        </ArtContainer>
        <VStackWithAdjustedMargin gap={24} alignItems="center">
          <Description>{t('backupnow_description')}</Description>
          <SubDescription>
            <Text as="span">{t('backupnow_note_part1')}</Text>{' '}
            <Text as="span" weight={600}>
              {t('backupnow_note_part2')}
            </Text>{' '}
            <Text as="span">{t('backupnow_note_part3')}</Text>
          </SubDescription>
        </VStackWithAdjustedMargin>
        <KeygenVaultBackupBanner />
      </VStack>
      <VStack gap={16}>
        <Link to={makeAppPath('vaultBackup')}>
          <Button as="div" kind="primary">
            {t('backup')}
          </Button>
        </Link>
        {!isFastVault && (
          <Opener
            renderOpener={({ onOpen }) => (
              <Button as="div" kind="outlined" onClick={onOpen}>
                {t('skip')}
              </Button>
            )}
            renderContent={({ onClose }) => (
              <KeygenSkipVaultBackupAttentionModal
                onSkip={() => navigate('vault')}
                onClose={onClose}
              />
            )}
          />
        )}
      </VStack>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
`;

const ArtContainer = styled.div`
  height: 260px;
`;

const VStackWithAdjustedMargin = styled(VStack)`
  margin-top: -24px;
`;

const Description = styled.p`
  ${text({
    color: 'contrast',
    size: 24,
    weight: '500',
    centerHorizontally: true,
  })}
`;

const SubDescription = styled.p`
  ${text({
    color: 'contrast',
    size: 16,
    weight: '200',
    centerHorizontally: true,
  })}
`;
