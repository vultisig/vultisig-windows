import { useTranslation } from 'react-i18next';

import { useInAppCurrency } from '../../../lib/hooks/useInAppCurrency';
import { CheckIcon } from '../../../lib/ui/icons/CheckIcon';
import { ScrollableFlexboxFiller } from '../../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { currencyOptions } from './constants';
import {
  CurrencyBox,
  CurrencyButton,
  StyledPageSlice,
} from './CurrencySettingsPage.styles';

const CurrencySettingsPage = () => {
  const { t } = useTranslation();
  const { currency, changeInAppCurrency } = useInAppCurrency();

  return (
    <ScrollableFlexboxFiller>
      <VStack flexGrow gap={16}>
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={
            <PageHeaderTitle>
              {t('vault_currency_settings_page_header_title')}
            </PageHeaderTitle>
          }
        />
        <StyledPageSlice gap={16} flexGrow={true}>
          {currencyOptions.map(({ title, value }, index) => (
            <CurrencyButton
              key={index}
              onClick={() => changeInAppCurrency(value)}
            >
              <CurrencyBox>
                <Text size={16} color="contrast" weight="600">
                  {t(title)}
                </Text>
              </CurrencyBox>
              {value === currency && <CheckIcon />}
            </CurrencyButton>
          ))}
        </StyledPageSlice>
      </VStack>
    </ScrollableFlexboxFiller>
  );
};

export default CurrencySettingsPage;
