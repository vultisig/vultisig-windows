import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '../../../lib/ui/buttons/Button';
import { UniformColumnGrid } from '../../../lib/ui/css/uniformColumnGrid';
import { ContainImage } from '../../../lib/ui/images/ContainImage';
import { SafeImage } from '../../../lib/ui/images/SafeImage';
import { VStack, vStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { makeAppPath } from '../../../navigation';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import {
  KeygenThresholdType,
  keygenThresholdTypes,
} from '../../keygen/KeygenThresholdType';

const artRecord: Record<KeygenThresholdType, string> = {
  '2/2': '/assets/images/vaultSetup1.svg',
  '2/3': '/assets/images/vaultSetup2.svg',
  'm/n': '/assets/images/vaultSetup3.svg',
};

const ArtContainer = styled.div`
  ${vStack({
    flexGrow: true,
  })}
  flex-basis: 0;
  overflow: hidden;
`;

export const SetupVaultKeygenThresholdPage = () => {
  const { t } = useTranslation();

  const [{ thresholdType }, setParams] =
    useAppPathParams<'setupVaultKeygenThreshold'>();

  const descriptionRecord: Record<KeygenThresholdType, string> = {
    '2/2': t('vault_type_1_description'),
    '2/3': t('vault_type_2_description'),
    'm/n': t('vault_type_3_description'),
  };

  const art = artRecord[thresholdType];
  const description = descriptionRecord[thresholdType];

  return (
    <VStack flexGrow>
      <PageHeader
        title={<PageHeaderTitle>{t('setup')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
      />
      <PageContent gap={40}>
        <VStack gap={20}>
          <VStack alignItems="center">
            <Text family="mono" color="contrast">
              {t('select_your_vault_type')}
            </Text>
          </VStack>
          <UniformColumnGrid fullWidth gap={8}>
            {keygenThresholdTypes.map(option => {
              const text = option
                .split('/')
                .map(v => v.toUpperCase())
                .join(` ${t('of')} `);

              const isSelected = thresholdType === option;

              return (
                <Button
                  onClick={() =>
                    setParams(params => ({ ...params, thresholdType: option }))
                  }
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
          <Text weight="600" color="contrast">
            {description}
          </Text>
          <ArtContainer>
            <SafeImage
              src={art}
              render={props => <ContainImage {...props} />}
            />
          </ArtContainer>
        </VStack>
        <Link to={makeAppPath('setupVaultInitiatingDevice', { thresholdType })}>
          <Button as="div">{t('continue')}</Button>
        </Link>
      </PageContent>
    </VStack>
  );
};
