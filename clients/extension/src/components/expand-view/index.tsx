import { useCore } from '@core/ui/state/core'
import { ExpandIcon } from '@lib/ui/icons/ExpandIcon'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

export const ExpandView = () => {
  const { t } = useTranslation()
  const { openUrl } = useCore()

  return (
    <ListItem
      icon={<ExpandIcon fontSize={20} />}
      onClick={() =>
        openUrl(`chrome-extension://${chrome.runtime.id}/index.html`)
      }
      title={t('expand_view')}
      hoverable
      showArrow
    />
  )
}
