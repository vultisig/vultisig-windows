import { languages } from '@core/ui/i18n/Language'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useLanguage } from '../../../preferences/state/language'
import { LanguageBox, LanguageButton } from './LanguageSettingsPage.styles'

const LanguageSettingsPage = () => {
  const { t } = useTranslation()
  const [value, setValue] = useLanguage()

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('language')}</PageHeaderTitle>}
      />
      <PageSlice gap={16} flexGrow={true}>
        {languages.map((language, index) => {
          return (
            <LanguageButton key={index} onClick={() => setValue(language)}>
              <LanguageBox>
                <Text size={16} color="contrast" weight="600">
                  {t(`vault_settings_language_settings_title_${language}`)}
                </Text>
                <Text size={12} color="contrast" weight="500">
                  {t(`vault_settings_language_settings_subtitle_${language}`)}
                </Text>
              </LanguageBox>
              {value === language && <CheckIcon />}
            </LanguageButton>
          )
        })}
      </PageSlice>
    </VStack>
  )
}

export default LanguageSettingsPage
