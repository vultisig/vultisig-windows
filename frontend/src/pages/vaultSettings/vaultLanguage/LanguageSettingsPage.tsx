import { useTranslation } from 'react-i18next';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { languageOptions } from './constants';
import { ListItemPanel } from '../SettingsVaultPage.styles';

const LanguageSettingsPage = () => {
  const { t } = useTranslation();

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_rename_page_header_title')}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {languageOptions.map(({ title, subtitle }, index) => (
          <ListItemPanel key={index}>
            <Text size={16} color="contrast" weight="600">
              {t(title)}
            </Text>
            <Text size={12} color="contrast" weight="500">
              {t(subtitle)}
            </Text>
          </ListItemPanel>
        ))}
      </PageSlice>
    </VStack>
  );
};

export default LanguageSettingsPage;
