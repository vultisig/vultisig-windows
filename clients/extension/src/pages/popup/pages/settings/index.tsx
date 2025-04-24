import packageJson from '@clients/extension/package.json'
import { useLanguageQuery } from '@clients/extension/src/i18n/state/language'
import {
  ArrowLeft,
  ArrowRight,
  CircleDollar,
  CircleHelp,
  SettingsOne,
  Translate,
  Vultisig,
} from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { languageName } from '@core/ui/i18n/Language'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Component = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  const currency = useFiatCurrency()

  const languageQuery = useLanguageQuery()

  return (
    <div className="layout settings-page">
      <div className="header">
        <span className="heading">{t('settings')}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => navigate('main')}
        />
      </div>
      <div className="content">
        <div className="list list-arrow list-action list-icon">
          <Link to={appPaths.vaultSettings} state={true} className="list-item">
            <SettingsOne className="icon" />
            <span className="label">{t('vault_settings')}</span>
            <ArrowRight className="action" />
          </Link>
          <MatchQuery
            value={languageQuery}
            success={language => (
              <Link
                to={appPaths.languageSettings}
                state={true}
                className="list-item"
              >
                <Translate className="icon" />
                <span className="label">{t('language')}</span>
                <span className="extra">{languageName[language]}</span>
                <ArrowRight className="action" />
              </Link>
            )}
          />
          <Link
            to={appPaths.currencySettings}
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
