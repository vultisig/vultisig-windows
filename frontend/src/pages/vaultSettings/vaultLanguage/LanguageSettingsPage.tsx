import { useTranslation } from 'react-i18next';

import { useInAppLanguage } from '../../../lib/hooks/useInAppLanguage';
import { CheckIcon } from '../../../lib/ui/icons/CheckIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { languageOptions } from './constants';
import { LanguageBox, LanguageButton } from './LanguageSettingsPage.styles';

const LanguageSettingsPage = () => {
  const { t } = useTranslation();
  const { language, updateInAppLanguage } = useInAppLanguage();

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_settings_language')}</PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {languageOptions.map(({ title, subtitle, value }, index) => (
          <LanguageButton
            key={index}
            onClick={() => updateInAppLanguage(value)}
          >
            <LanguageBox>
              <Text size={16} color="contrast" weight="600">
                {t(title)}
              </Text>
              <Text size={12} color="contrast" weight="500">
                {t(subtitle)}
              </Text>
            </LanguageBox>
            {value === language && <CheckIcon />}
          </LanguageButton>
        ))}
      </PageSlice>
    </VStack>
  );
};

export default LanguageSettingsPage;
