import { useParams } from 'react-router-dom';
import { vStack, VStack } from '../../../lib/ui/layout/Stack';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { AddressPathParams } from '../../../navigation';
import { useTranslation } from 'react-i18next';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageContent } from '../../../ui/page/PageContent';
import { Text } from '../../../lib/ui/text';
import { ElementSizeAware } from '../../../lib/ui/base/ElementSizeAware';
import { AddressQrCode } from './AddressQrCode';
import styled from 'styled-components';
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
  const params = useParams<AddressPathParams>();
  const address = shouldBePresent(params.address);

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
                <AddressQrCode
                  value={address}
                  size={Math.min(size.width, size.height)}
                />
              )}
            </Content>
          )}
        />
      </PageContent>
    </VStack>
  );
};
