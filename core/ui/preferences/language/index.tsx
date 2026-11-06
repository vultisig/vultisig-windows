import { languageName, languageRegion, languages } from '@core/ui/i18n/Language'
import { SettingsFlushCard } from '@core/ui/settings/SettingsCard'
import { SettingsOptionItem } from '@core/ui/settings/SettingsOptionItem'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useLanguage, useSetLanguageMutation } from '@core/ui/storage/language'
import { VStack } from '@lib/ui/layout/Stack'
import { useTranslation } from 'react-i18next'

export const LanguagePage = () => {
  const { t } = useTranslation()
  const language = useLanguage()
  const setLanguage = useSetLanguageMutation()

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('language')} />
      <SettingsPageContent flexGrow scrollable>
        <SettingsFlushCard>
          {languages.map(key => (
            <SettingsOptionItem
              description={languageRegion[key]}
              isSelected={key === language}
              key={key}
              onClick={() => setLanguage.mutate(key)}
              title={languageName[key]}
            />
          ))}
        </SettingsFlushCard>
      </SettingsPageContent>
    </VStack>
  )
}
