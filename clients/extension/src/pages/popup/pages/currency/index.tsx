import { ArrowLeft } from '@clients/extension/src/icons'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { Currency, currencyName } from '@clients/extension/src/utils/constants'
import {
  getStoredCurrency,
  setStoredCurrency,
} from '@clients/extension/src/utils/storage'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  currency: Currency
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { currency: Currency.USD }
  const [state, setState] = useState(initialState)
  const { currency } = state
  const navigate = useAppNavigate()

  const changeCurrency = (currency: Currency) => {
    setStoredCurrency(currency).then(() => {
      setState(prevState => ({ ...prevState, currency }))

      navigate('settings')
    })
  }

  const componentDidMount = (): void => {
    getStoredCurrency().then(currency => {
      setState(prevState => ({ ...prevState, currency }))
    })
  }

  useEffect(componentDidMount, [])

  const data = [
    {
      key: Currency.USD,
      title: currencyName[Currency.USD],
    },
    {
      key: Currency.AUD,
      title: currencyName[Currency.AUD],
    },
    {
      key: Currency.CAD,
      title: currencyName[Currency.CAD],
    },
    {
      key: Currency.SGD,
      title: currencyName[Currency.SGD],
    },
    {
      key: Currency.EUR,
      title: currencyName[Currency.EUR],
    },
    {
      key: Currency.RUB,
      title: currencyName[Currency.RUB],
    },
    {
      key: Currency.GBP,
      title: currencyName[Currency.GBP],
    },
    {
      key: Currency.JPY,
      title: currencyName[Currency.JPY],
    },
    {
      key: Currency.CNY,
      title: currencyName[Currency.CNY],
    },
    {
      key: Currency.SEK,
      title: currencyName[Currency.SEK],
    },
  ]

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
          {data.map(({ key, title }) => (
            <button
              key={key}
              className={`list-item${key === currency ? ' active' : ''}`}
              onClick={() => changeCurrency(key)}
            >
              <span className="label">{title}</span>
              <span className="extra">{key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Component
