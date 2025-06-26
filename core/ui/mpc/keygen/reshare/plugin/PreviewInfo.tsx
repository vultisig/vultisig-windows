import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const PreviewInfo: FC<OnFinishProp & ValueProp<string>> = ({
  value: name,
  onFinish,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader title={t('plugin_info')} hasBorder />
      <PageContent alignItems="center" scrollable>
        <VStack maxWidth={576} fullWidth>
          <SafeImage
            src={`core/images/plugin-information.png`}
            render={props => (
              <img alt="" {...props} style={{ width: '100%' }} />
            )}
          />
        </VStack>
      </PageContent>
      <PageFooter alignItems="center" gap={24}>
        <Text as="span" size={28} weight={500} centerHorizontally>
          {t('plugin_info_desc', { name })}
        </Text>
        <IconButton kind="primary" onClick={onFinish} size="xl">
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </>
  )
}
