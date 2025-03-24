import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft } from '@clients/extension/src/icons'
import routeKeys from '@clients/extension/src/utils/route-keys'
import { languageName, languages } from '@core/ui/i18n/Language'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import {
  useLanguageMutation,
  useLanguageQuery,
} from '../../../../i18n/state/language'

const Component = () => {
  const { t } = useTranslation()
  const goBack = useGoBack()
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
              onClick={() => goBack(routeKeys.settings.root)}
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
