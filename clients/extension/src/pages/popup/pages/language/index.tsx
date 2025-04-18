import {
  useLanguageMutation,
  useLanguageQuery,
} from '@clients/extension/src/i18n/state/language'
import { ArrowLeft } from '@clients/extension/src/icons'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { languageName, languages } from '@core/ui/i18n/Language'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

const Component = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const languageQuery = useLanguageQuery()
  const languageMutation = useLanguageMutation()

  return (
    <MatchQuery
      value={languageQuery}
      success={language => (
        <div className="layout language-page">
          <div className="header">
            <span className="heading">{t('language')}</span>
            <ArrowLeft
              className="icon icon-left"
              onClick={() => navigate('root')}
            />
          </div>
          <div className="content">
            <div className="list list-action">
              {languages.map(key => (
                <button
                  key={key}
                  className={`list-item${key === language ? ' active' : ''}`}
                  onClick={() => languageMutation.mutate(key)}
                >
                  {languageName[key]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    />
  )
}

export default Component
