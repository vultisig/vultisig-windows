import packageJson from '@clients/extension/package.json'
import useGoBack from '@clients/extension/src/hooks/go-back'
import {
  ArrowLeft,
  ArrowRight,
  CircleDollar,
  CircleHelp,
  SettingsOne,
  Translate,
  Vultisig,
} from '@clients/extension/src/icons'
import { Currency } from '@clients/extension/src/utils/constants'
import routeKeys from '@clients/extension/src/utils/route-keys'
import {
  getStoredCurrency,
  getStoredLanguage,
} from '@clients/extension/src/utils/storage'
import { Language, languageName, primaryLanguage } from '@core/ui/i18n/Language'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface InitialState {
  currency: Currency
  language: Language
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {
    currency: Currency.USD,
    language: primaryLanguage,
  }
  const [state, setState] = useState(initialState)
  const { currency, language } = state
  const goBack = useGoBack()

  const componentDidMount = (): void => {
    getStoredCurrency().then(currency => {
      setState(prevState => ({ ...prevState, currency }))
    })

    getStoredLanguage().then(language => {
      setState(prevState => ({ ...prevState, language }))
    })
  }

  useEffect(componentDidMount, [])

  return (
    <div className="layout settings-page">
      <div className="header">
        <span className="heading">{t('settings')}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(routeKeys.main)}
        />
      </div>
      <div className="content">
        <div className="list list-arrow list-action list-icon">
          <Link
            to={routeKeys.settings.vault}
            state={true}
            className="list-item"
          >
            <SettingsOne className="icon" />
            <span className="label">{t('vault_settings')}</span>
            <ArrowRight className="action" />
          </Link>
          <Link
            to={routeKeys.settings.language}
            state={true}
            className="list-item"
          >
            <Translate className="icon" />
            <span className="label">{t('language')}</span>
            <span className="extra">{languageName[language]}</span>
            <ArrowRight className="action" />
          </Link>
          <Link
            to={routeKeys.settings.currency}
            state={true}
            className="list-item"
          >
            <CircleDollar className="icon" />
            <span className="label">{t('currency')}</span>
            <span className="extra">{currency}</span>
            <ArrowRight className="action" />
          </Link>
          <a
            href="https://vultisig.com/faq"
            rel="noopener noreferrer"
            target="_blank"
            className="list-item"
          >
            <CircleHelp className="icon" />
            <span className="label">{t('faq')}</span>
            <ArrowRight className="action" />
          </a>
        </div>
        <span className="divider">{t('other')}</span>
        <div className="list list-action list-icon">
          <a
            href="https://vultisig.com/vult"
            rel="noopener noreferrer"
            target="_blank"
            className="list-item"
          >
            <Vultisig className="icon" />
            <span className="label">{t('vult_token')}</span>
          </a>
        </div>
      </div>
      <div className="footer">
        <a
          target="_blank"
          href="https://chromewebstore.google.com/detail/vulticonnect/ggafhcdaplkhmmnlbfjpnnkepdfjaelb"
          className="version"
          rel="noreferrer"
        >
          VULTICONNECT V{packageJson.version}
        </a>
      </div>
    </div>
  )
}

export default Component
