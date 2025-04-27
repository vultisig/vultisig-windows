import { ArrowLeft } from '@clients/extension/src/icons'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { fiatCurrencies } from '@core/config/FiatCurrency'
import {
  useFiatCurrency,
  useSetFiatCurrencyMutation,
} from '@core/ui/state/fiatCurrency'
import { useTranslation } from 'react-i18next'

const Component = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  const value = useFiatCurrency()

  const { mutate: setValue } = useSetFiatCurrencyMutation()

  return (
    <div className="layout currency-page">
      <div className="header">
        <span className="heading">{t('currency')}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => navigate('settings')}
        />
      </div>
      <div className="content">
        <div className="list list-action">
          {fiatCurrencies.map(option => (
            <button
              key={option}
              className={`list-item${option === value ? ' active' : ''}`}
              onClick={() => setValue(option)}
            >
              <span className="label">{option.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Component
