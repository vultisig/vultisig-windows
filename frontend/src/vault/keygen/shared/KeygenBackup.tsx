import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import KeygenVaultBackupBanner from '../../../components/vaultBackupBanner/KeygenVaultBackupBanner/KeygenVaultBackupBanner';
import { Button } from '../../../lib/ui/buttons/Button';
import { ContainImage } from '../../../lib/ui/images/ContainImage';
import { SafeImage } from '../../../lib/ui/images/SafeImage';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text, text } from '../../../lib/ui/text';
import { makeAppPath } from '../../../navigation';
import { ProductLogo } from '../../../ui/logo/ProductLogo';
import { PageContent } from '../../../ui/page/PageContent';
import KeygenSkipVaultBackupAttentionModal from './KeygenSkipVaultBackupAttentionModal';

export const KeygenBackup = () => {
  const { t } = useTranslation();
  const [isSaveBackupModalOpen, setIsSaveBackupModalOpen] = useState(true);

  return (
    <>
      <PageContent>
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
          <Button
            as="div"
            kind="outlined"
            onClick={() => setIsSaveBackupModalOpen(true)}
          >
            {t('skip')}
          </Button>
        </VStack>
      </PageContent>
      <KeygenSkipVaultBackupAttentionModal
        onSkip={() => makeAppPath('vault')}
        isOpen={isSaveBackupModalOpen}
        onClose={() => setIsSaveBackupModalOpen(false)}
      />
    </>
  );
};

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
