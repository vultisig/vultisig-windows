import { getFiatCurrencySymbol } from '@core/ui/chain/utils/getFiatCurrencySymbol'
import { SettingsFlushCard } from '@core/ui/settings/SettingsCard'
import { SettingsOptionItem } from '@core/ui/settings/SettingsOptionItem'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import {
  useFiatCurrency,
  useSetFiatCurrencyMutation,
} from '@core/ui/storage/fiatCurrency'
import { VStack } from '@lib/ui/layout/Stack'
import {
  fiatCurrencies,
  fiatCurrencyNameRecord,
} from '@vultisig/core-config/FiatCurrency'
import { useTranslation } from 'react-i18next'

export const CurrencyPage = () => {
  const { t } = useTranslation()
  const currencyValue = useFiatCurrency()
  const currencyMutation = useSetFiatCurrencyMutation()

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('currency')} />
      <SettingsPageContent flexGrow scrollable>
        <SettingsFlushCard>
          {fiatCurrencies.map(key => (
            <SettingsOptionItem
              isSelected={key === currencyValue}
              key={key}
              onClick={() => currencyMutation.mutate(key)}
              title={`${fiatCurrencyNameRecord[key]} (${getFiatCurrencySymbol(key)})`}
            />
          ))}
        </SettingsFlushCard>
      </SettingsPageContent>
    </VStack>
  )
}
