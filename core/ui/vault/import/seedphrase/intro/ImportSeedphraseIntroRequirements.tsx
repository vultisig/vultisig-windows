import { SeedphraseIcon } from '@lib/ui/icons/SeedphraseIcon'
import { TabletSmartphoneIcon } from '@lib/ui/icons/TabletSmartphoneIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { Trans, useTranslation } from 'react-i18next'

import { ImportRequirementRow } from './ImportRequirementRow'

export const ImportSeedphraseIntroRequirements = () => {
  const { t } = useTranslation()

  return (
    <VStack gap={32}>
      <VStack gap={12}>
        <Text color="shy" size={12} weight={500}>
          {t('before_you_start')}
        </Text>
        <Text size={22} weight={500} height="large">
          <Trans
            i18nKey="import_seedphrase_onboarding_title"
            components={{ g: <GradientText /> }}
          />
        </Text>
      </VStack>

      <VStack gap={24}>
        <ImportRequirementRow
          icon={<SeedphraseIcon />}
          title={t('your_seedphrase')}
          description={t('your_seedphrase_subtitle')}
        />
        <ImportRequirementRow
          icon={<TabletSmartphoneIcon />}
          title={t('at_least_one_device')}
          description={t('at_least_one_device_subtitle')}
        />
      </VStack>
    </VStack>
  )
}
