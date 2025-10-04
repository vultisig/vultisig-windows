import {
  fiatCurrencies,
  fiatCurrencyNameRecord,
  fiatCurrencySymbolRecord,
} from '@core/config/FiatCurrency'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  useFiatCurrency,
  useSetFiatCurrencyMutation,
} from '@core/ui/storage/fiatCurrency'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const CurrencyPage = () => {
  const { t } = useTranslation()
  const currencyValue = useFiatCurrency()
  const currencyMutation = useSetFiatCurrencyMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('currency')}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          {fiatCurrencies.map(key => (
            <ListItem
              extra={key === currencyValue && <CircleCheckIcon />}
              key={key}
              onClick={() => currencyMutation.mutate(key)}
              title={`${fiatCurrencyNameRecord[key]} (${fiatCurrencySymbolRecord[key]})`}
              hoverable
            />
          ))}
        </List>
      </PageContent>
    </VStack>
  )
}

const CircleCheckIcon = styled(CheckIcon)`
  background-color: ${getColor('buttonPrimary')};
  border-radius: 50%;
  font-size: 16px;
  padding: 2px;
`
