import { I18nProvider as CoreI18nProvider } from '@core/ui/i18n/I18nProvider'
import { primaryLanguage } from '@core/ui/i18n/Language'
import { ChildrenProp } from '@lib/ui/props'

export const I18nProvider = ({ children }: ChildrenProp) => {
  return (
    <CoreI18nProvider language={primaryLanguage}>{children}</CoreI18nProvider>
  )
}
