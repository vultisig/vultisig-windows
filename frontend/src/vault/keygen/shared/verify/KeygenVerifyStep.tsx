import { useTranslation } from 'react-i18next';

import { Button } from '../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { OnBackProp, OnForwardProp } from '../../../../lib/ui/props';
import { InfoBlock } from '../../../../lib/ui/status/InfoBlock';
import { Text } from '../../../../lib/ui/text';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { useVaultKeygenDevices } from '../../../setup/hooks/useVaultKegenDevices';
import { getVaultActionSignersMin } from '../../utils/getVaultActionSignersMin';
import { VaultDeviceItem } from './VaultDeviceItem';

export const KeygenVerifyStep = ({
  onBack,
  onForward,
}: OnForwardProp & OnBackProp) => {
  const { t } = useTranslation();

  const devices = useVaultKeygenDevices();

  const minSigners = getVaultActionSignersMin(devices.length);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
      />
      <PageContent
        gap={40}
        as="form"
        {...getFormProps({
          onSubmit: onForward,
        })}
      >
        <VStack flexGrow justifyContent="space-between">
          <VStack gap={32}>
            <VStack gap={12} alignItems="center">
              <Text weight="500" size={16} color="contrast">
                {minSigners} {t('of')} {devices.length} {t('vault')}
              </Text>
              <Text size={14} weight="600" color="contrast">
                {t('devices_list_title')}
              </Text>
            </VStack>
            <VStack gap={16}>
              {devices.map((device, index) => (
                <VaultDeviceItem key={device} index={index} value={device} />
              ))}
            </VStack>
          </VStack>
          <VStack gap={12}>
            <InfoBlock>
              {t('min_signers_disclaimer', { count: minSigners })}
            </InfoBlock>

            <InfoBlock>{t('backup_disclaimer')}</InfoBlock>
          </VStack>
        </VStack>
        <Button type="submit">{t('continue')}</Button>
      </PageContent>
    </>
  );
};
