import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../lib/ui/buttons/Button';
import { round } from '../../lib/ui/css/round';
import { sameDimensions } from '../../lib/ui/css/sameDimensions';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { getFormProps } from '../../lib/ui/form/utils/getFormProps';
import { ContainImage } from '../../lib/ui/images/ContainImage';
import { SafeImage } from '../../lib/ui/images/SafeImage';
import { HStack, VStack, vStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { getColor } from '../../lib/ui/theme/getters';
import { match } from '../../lib/utils/match';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import {
  getSetupVaultArt,
  getSetupVaultProperties,
  getSetupVaultPurpose,
  setupVaultTypes,
} from './type/SetupVaultType';
import { useSetupVaultType } from './type/state/setupVaultType';

const ArtContainer = styled.div`
  ${vStack({
    flexGrow: true,
  })}
  flex-basis: 0;
  overflow: hidden;
`;

const Dot = styled.div`
  ${sameDimensions(4)};
  ${round};
  background: ${getColor('contrast')};
`;

export const SetupVaultPage = () => {
  const { t } = useTranslation();
  const [value, setValue] = useSetupVaultType();

  const navigate = useAppNavigate();
  const onStart = useCallback(() => {
    navigate(
      match(value, {
        fast: () => 'setupFastVault',
        secure: () => 'setupSecureVault',
        active: () => 'setupActiveVault',
      })
    );
  }, [navigate, value]);

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
        <VStack gap={20}>
          <UniformColumnGrid fullWidth gap={8}>
            {setupVaultTypes.map(option => {
              const text = t(option).toUpperCase();

              const isSelected = value === option;

              return (
                <Button
                  onClick={() => setValue(option)}
                  kind={isSelected ? 'primary' : 'outlined'}
                  key={option}
                >
                  {text}
                </Button>
              );
            })}
          </UniformColumnGrid>
        </VStack>
        <VStack alignItems="center" gap={20} flexGrow>
          <ArtContainer>
            <SafeImage
              src={getSetupVaultArt(value)}
              render={props => <ContainImage {...props} />}
            />
          </ArtContainer>
          <VStack gap={8} alignItems="center">
            {getSetupVaultProperties(value).map(prop => (
              <HStack key={prop} alignItems="center" gap={6}>
                <Dot />
                <Text size={14} weight="600" color="contrast">
                  {t(prop)}
                </Text>
              </HStack>
            ))}
          </VStack>
          <Text size={14} weight="600" color="contrast">
            {t(getSetupVaultPurpose(value))}
          </Text>
        </VStack>
        <VStack gap={20}>
          <Button type="submit">{t('start').toUpperCase()}</Button>
          {value !== 'fast' && (
            <Button
              onClick={() =>
                navigate('uploadQr', { params: { title: t('join_keygen') } })
              }
              kind="outlined"
            >
              {t('pair')}
            </Button>
          )}
        </VStack>
      </PageContent>
    </>
  );
};
