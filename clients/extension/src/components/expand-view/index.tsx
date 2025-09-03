import { isPopupView } from '@clients/extension/src/utils/functions'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import { ExpandIcon } from '@lib/ui/icons/ExpandIcon'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

import { useOpenInExpandedViewMutation } from '../../expanded-view/mutations/openInExpandedView'

export const ExpandView = () => {
  const { t } = useTranslation()
  const visible = isPopupView()

  const { mutate: openInExpandedView } = useOpenInExpandedViewMutation()

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
