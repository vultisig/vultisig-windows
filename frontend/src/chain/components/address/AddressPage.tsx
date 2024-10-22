import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ElementSizeAware } from '../../../lib/ui/base/ElementSizeAware';
import { VStack, vStack } from '../../../lib/ui/layout/Stack';
import { FramedQrCode } from '../../../lib/ui/qr/FramedQrCode';
import { Text } from '../../../lib/ui/text';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { DownloadAddressQrCode } from './DownloadAddressQrCode';

const Content = styled.div`
  position: relative;
  ${vStack({
    flexGrow: true,
    alignItems: 'center',
    justifyContent: 'center',
    fullWidth: true,
  })}
`;

export const AddressPage = () => {
  const [{ address }] = useAppPathParams<'address'>();

  const { t } = useTranslation();

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('address')}</PageHeaderTitle>}
        secondaryControls={<DownloadAddressQrCode value={address} />}
      />
      <PageContent alignItems="center" gap={40}>
        <Text weight="600" size={14} family="mono" color="contrast">
          {address}
        </Text>
        <ElementSizeAware
          render={({ setElement, size }) => (
            <Content ref={setElement}>
              {size && (
                <FramedQrCode
                  style={{ position: 'absolute' }}
                  value={address}
                />
              )}
            </Content>
          )}
        />
      </PageContent>
    </VStack>
  );
};
