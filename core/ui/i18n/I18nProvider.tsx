import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'

import i18nInstance from './config'
import { Language } from './Language'

export const I18nProvider = ({
  children,
  language,
}: ChildrenProp & { language: Language }) => {
  useEffect(() => {
    i18nInstance.changeLanguage(language)
  }, [language])

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
