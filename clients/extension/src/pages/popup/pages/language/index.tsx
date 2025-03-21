import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft } from '@clients/extension/src/icons'
import routeKeys from '@clients/extension/src/utils/route-keys'
import {
  getStoredLanguage,
  setStoredLanguage,
} from '@clients/extension/src/utils/storage'
import { Language, primaryLanguage } from '@core/ui/i18n/Language'
import { languageName, languages } from '@core/ui/i18n/Language'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  language: Language
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { language: primaryLanguage }
  const [state, setState] = useState(initialState)
  const { language } = state
  const goBack = useGoBack()

  const changeLanguage = (language: Language) => {
    setStoredLanguage(language).then(() => {
      setState(prevState => ({ ...prevState, language }))

      goBack(routeKeys.settings.root)
    })
  }

  const componentDidMount = (): void => {
    getStoredLanguage().then(language => {
      setState(prevState => ({ ...prevState, language }))
    })
  }

  useEffect(componentDidMount, [])

  return (
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
              onClick={() => changeLanguage(key)}
            >
              {languageName[key]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Component
