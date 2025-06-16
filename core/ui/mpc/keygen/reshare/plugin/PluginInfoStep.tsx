import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type PluginInfoStepProps = {
  name: string
  onNext: () => void
}

export const PluginInfoStep: FC<PluginInfoStepProps> = ({ name, onNext }) => {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader title={t('plugin_info')} hasBorder />
      <PageContent alignItems="center"></PageContent>
      <PageFooter alignItems="center" gap={24}>
        <Text as="span" size={28} weight={500} centerHorizontally>
          {t('plugin_info_desc', { name })}
        </Text>
        <IconButton kind="primary" onClick={onNext} size="xl">
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </>
  )
}
