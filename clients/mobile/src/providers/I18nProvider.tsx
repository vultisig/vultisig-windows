import { FC, PropsWithChildren, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'

import { useAppLanguage } from '../hooks/useAppLanguage'
import i18nInstance from '../i18n/config'

export const I18nProvider: FC<PropsWithChildren> = ({ children }) => {
  const [language] = useAppLanguage()

  useEffect(() => {
    i18nInstance.changeLanguage(language)
  }, [language])

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
