import { useOpenInExpandedViewMutation } from '@clients/extension/src/expanded-view/mutations/openInExpandedView'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import { useIsScreenWidthLessThan } from '@lib/ui/hooks/useIsScreenWidthLessThan'
import { ExpandIcon } from '@lib/ui/icons/ExpandIcon'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

export const ExpandView = () => {
  const { t } = useTranslation()
  const { mutate: openInExpandedView } = useOpenInExpandedViewMutation()
  const visible = useIsScreenWidthLessThan(481)

  return (
    visible && (
      <ListItem
        icon={<ExpandIcon fontSize={20} />}
        onClick={() => openInExpandedView(initialCoreView)}
        title={t('expand_view')}
        hoverable
        showArrow
      />
    )
  )
}
