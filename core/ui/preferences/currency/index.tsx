import { fiatCurrencies } from '@core/config/FiatCurrency'
import {
  useFiatCurrency,
  useSetFiatCurrencyMutation,
} from '@core/ui/storage/fiatCurrency'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { useTranslation } from 'react-i18next'

export const CurrencyPage = () => {
  const { t } = useTranslation()
  const currencyValue = useFiatCurrency()
  const currencyMutation = useSetFiatCurrencyMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('currency')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          {fiatCurrencies.map(key => (
            <ListItem
              extra={
                key === currencyValue && (
                  <ListItemTag status="success" title={t('active')} />
                )
              }
              key={key}
              onClick={() => currencyMutation.mutate(key)}
              title={key.toUpperCase()}
              hoverable
            />
          ))}
        </List>
      </PageContent>
    </VStack>
  )
}
