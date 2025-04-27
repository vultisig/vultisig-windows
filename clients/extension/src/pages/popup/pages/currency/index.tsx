import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { fiatCurrencies } from '@core/config/FiatCurrency'
import {
  useFiatCurrency,
  useSetFiatCurrencyMutation,
} from '@core/ui/state/fiatCurrency'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const CurrencyPage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const currencyValue = useFiatCurrency()
  const currencyMutation = useSetFiatCurrencyMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        hasBorder
        primaryControls={
          <Button onClick={() => navigate('settings')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('currency')}
          </Text>
        }
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
