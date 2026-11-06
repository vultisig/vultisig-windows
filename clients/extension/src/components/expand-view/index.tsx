import { useOpenInExpandedViewMutation } from '@clients/extension/src/expanded-view/mutations/openInExpandedView'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { useIsScreenWidthLessThan } from '@lib/ui/hooks/useIsScreenWidthLessThan'
import { Expand2Icon } from '@lib/ui/icons/Expand2Icon'
import { useTranslation } from 'react-i18next'

export const ExpandView = () => {
  const { t } = useTranslation()
  const { mutate: openInExpandedView } = useOpenInExpandedViewMutation()
  const visible = useIsScreenWidthLessThan(481)

  return (
    visible && (
      <SettingsItem
        icon={<Expand2Icon />}
        onClick={() => openInExpandedView(initialCoreView)}
        title={t('expand_view')}
      />
    )
  )
}
