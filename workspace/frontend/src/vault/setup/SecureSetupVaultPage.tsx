import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../lib/ui/buttons/Button';
import { getFormProps } from '../../lib/ui/form/utils/getFormProps';
import { ContainImage } from '../../lib/ui/images/ContainImage';
import { SafeImage } from '../../lib/ui/images/SafeImage';
import { HStack, VStack, vStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import {
  getSetupVaultArt,
  getSetupVaultProperties,
} from './type/SetupVaultType';

const ArtContainer = styled.div`
  ${vStack({
    flexGrow: true,
  })}
  flex-basis: 0;
  overflow: hidden;
`;

export const SecureSetupVaultPage = () => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();
  const onStart = useCallback(() => {
    navigate('setupSecureVault');
  }, [navigate]);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('setup')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
      />
      <PageContent
        gap={40}
        as="form"
        {...getFormProps({
          onSubmit: onStart,
        })}
      >
        <HStack style={{ marginInline: 'auto' }} alignItems="center" gap={8}>
          <img
            src="/assets/icons/secure_vault_icon.svg"
            alt="secure vault icon"
            height={40}
            width={40}
          />
          <Text size={16} weight="700" color="contrast">
            {t('secureVault')}
          </Text>
        </HStack>
        <VStack alignItems="center" gap={40} flexGrow>
          <ArtContainer>
            <SafeImage
              src={getSetupVaultArt('secure')}
              render={props => <ContainImage {...props} />}
            />
          </ArtContainer>
          <VStack gap={8} alignItems="start">
            {getSetupVaultProperties('secure').map(prop => (
              <HStack key={prop} alignItems="center" gap={6}>
                <img
                  src="/assets/icons/green_checkmark.svg"
                  alt="green checkmark"
                  height={24}
                  width={24}
                />
                <Text size={14} weight="500" color="contrast">
                  {t(prop)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
        <VStack gap={20}>
          <Button type="submit">{t('start').toUpperCase()}</Button>
          <Button
            onClick={() =>
              navigate('uploadQr', { params: { title: t('join_keygen') } })
            }
            kind="outlined"
          >
            {t('pair')}
          </Button>
        </VStack>
      </PageContent>
    </>
  );
};
