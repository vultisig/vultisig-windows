import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../../../lib/ui/buttons/Button';
import { ContainImage } from '../../../lib/ui/images/ContainImage';
import { SafeImage } from '../../../lib/ui/images/SafeImage';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text, text } from '../../../lib/ui/text';
import { makeAppPath } from '../../../navigation';
import { ProductLogo } from '../../../ui/logo/ProductLogo';
import { PageContent } from '../../../ui/page/PageContent';

const ArtContainer = styled.div`
  height: 260px;
`;

const Description = styled.p`
  ${text({
    color: 'contrast',
    size: 14,
    weight: '500',
    centerHorizontally: true,
  })}
`;

export const KeygenBackup = () => {
  const { t } = useTranslation();

  return (
    <PageContent>
      <VStack gap={48} flexGrow alignItems="center" justifyContent="center">
        <HStack alignItems="center" gap={8}>
          <ProductLogo style={{ fontSize: 48 }} />
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
        <VStack gap={20} alignItems="center">
          <Description>{t('backupnow_description')}</Description>
          <Description>{t('backupnow_note')}</Description>
        </VStack>
      </VStack>
      <VStack gap={16}>
        <Link to={makeAppPath('vaultBackup')}>
          <Button as="div" kind="primary">
            {t('backup')}
          </Button>
        </Link>
        <Link to={makeAppPath('vaultList')}>
          <Button as="div" kind="outlined">
            {t('skip')}
          </Button>
        </Link>
      </VStack>
    </PageContent>
  );
};
