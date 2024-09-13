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
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { FileUpIcon } from '../../../lib/ui/icons/FileUpIcon';
import { SaveFile } from '../../../../wailsjs/go/main/App';

const Content = styled.div`
  position: relative;
  ${vStack({
    flexGrow: true,
    alignItems: 'center',
    justifyContent: 'center',
    fullWidth: true,
  })}
`;

function base64EncodeUnicode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

export const AddressPage = () => {
  const params = useParams<AddressPathParams>();
  const address = shouldBePresent(params.address);

  const { t } = useTranslation();

  const handleSaveJSON = async () => {
    // Your JSON data
    const data = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    };

    // Convert JSON object to a string
    const jsonString = JSON.stringify(data, null, 2);

    // Base64 encode the JSON string
    const base64Data = base64EncodeUnicode(jsonString);

    // Suggested filename
    const suggestedFilename = 'data.json';

    // File filters (optional)
    const filters = [
      {
        DisplayName: 'JSON files (*.json)',
        Pattern: '*.json',
      },
      {
        DisplayName: 'All files (*.*)',
        Pattern: '*.*',
      },
    ];

    try {
      // Call the SaveFile method from Go backend
      const filename = await SaveFile(suggestedFilename, base64Data, filters);
      if (filename) {
        alert(`File saved successfully at ${filename}`);
      } else {
        alert('File save canceled.');
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('address')}</PageHeaderTitle>}
        secondaryControls={
          <PageHeaderIconButton
            icon={<FileUpIcon />}
            onClick={handleSaveJSON}
          />
        }
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
