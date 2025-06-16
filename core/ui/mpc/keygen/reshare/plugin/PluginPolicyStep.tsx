import { IconButton } from '@lib/ui/buttons/IconButton'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type PluginPolicyStepProps = {
  onBack: () => void
  onNext: () => void
}

export const PluginPolicyStep: FC<PluginPolicyStepProps> = ({
  onBack,
  onNext,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('plugin_policy')}
        hasBorder
      />
      <PageContent alignItems="center"></PageContent>
      <PageFooter alignItems="center" gap={24}>
        <Text as="span" color="shy" size={12} weight={500} centerHorizontally>
          {t('plugin_policy_desc')}
        </Text>
        <IconButton kind="primary" onClick={onNext} size="xl">
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </>
  )
}
