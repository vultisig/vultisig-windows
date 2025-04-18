import { useLanguageQuery } from '@clients/extension/src/i18n/state/language'
import { I18nProvider as CoreI18nProvider } from '@core/ui/i18n/I18nProvider'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

export const I18nProvider = ({ children }: ChildrenProp) => {
  const query = useLanguageQuery()

  return (
    <MatchQuery
      value={query}
      success={language => (
        <CoreI18nProvider language={language}>{children}</CoreI18nProvider>
      )}
    />
  )
}
