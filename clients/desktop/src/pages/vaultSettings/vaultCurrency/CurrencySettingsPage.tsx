import { fiatCurrencies } from '@core/config/FiatCurrency'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ScrollableFlexboxFiller } from '../../../lib/ui/layout/ScrollableFlexboxFiller'
import { useFiatCurrency } from '../../../preferences/state/fiatCurrency'
import {
  CurrencyBox,
  CurrencyButton,
  StyledPageSlice,
} from './CurrencySettingsPage.styles'

const CurrencySettingsPage = () => {
  const { t } = useTranslation()
  const [fiatCurrency, setFiatCurrency] = useFiatCurrency()

  return (
    <ScrollableFlexboxFiller>
      <VStack flexGrow gap={16}>
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={<PageHeaderTitle>{t('currency')}</PageHeaderTitle>}
        />
        <StyledPageSlice gap={16} flexGrow={true}>
          {fiatCurrencies.map((fiat, index) => (
            <CurrencyButton key={index} onClick={() => setFiatCurrency(fiat)}>
              <CurrencyBox>
                <Text size={16} color="contrast" weight="600">
                  {t(`vault_settings_currency_settings_title_${fiat}`)}
                </Text>
              </CurrencyBox>
              {fiat === fiatCurrency && <CheckIcon />}
            </CurrencyButton>
          ))}
        </StyledPageSlice>
      </VStack>
    </ScrollableFlexboxFiller>
  )
}

export default CurrencySettingsPage
