import { fiatCurrencies } from '@core/config/FiatCurrency'
import {
  useFiatCurrency,
  useSetFiatCurrencyMutation,
} from '@core/ui/storage/fiatCurrency'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { CurrencyBox, CurrencyButton } from './CurrencyPage.styles'

export const CurrencyPage = () => {
  const { t } = useTranslation()
  const fiatCurrency = useFiatCurrency()
  const { mutate: setFiatCurrency } = useSetFiatCurrencyMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('currency')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        {fiatCurrencies.map((fiat, index) => (
          <CurrencyButton key={index} onClick={() => setFiatCurrency(fiat)}>
            <CurrencyBox>
              <Text color="contrast" size={16} weight="600">
                {fiat.toUpperCase()}
              </Text>
            </CurrencyBox>
            {fiat === fiatCurrency && <CheckIcon />}
          </CurrencyButton>
        ))}
      </PageContent>
    </VStack>
  )
}
