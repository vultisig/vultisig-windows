import {
  useIsSidePanelEnabledQuery,
  useSetIsSidePanelEnabledMutation,
} from '@clients/extension/src/storage/isSidePanelEnabled'
import { ListItemIconWrapper } from '@core/ui/vault/settings'
import { PanelRightIcon } from '@lib/ui/icons/PanelRightIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { attempt } from '@lib/utils/attempt'
import { useTranslation } from 'react-i18next'

const switchToSidePanel = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  if (currentWindow.id == null) return false

  await chrome.sidePanel.open({ windowId: currentWindow.id })

  await new Promise(resolve => setTimeout(resolve, 500))

  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.SIDE_PANEL],
  })

  if (contexts.length === 0) return false

  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  return true
}

const switchToPopup = async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
}

export const ManageSidePanel = () => {
  const { t } = useTranslation()
  const { data: isSidePanelEnabled } = useIsSidePanelEnabledQuery()
  const { mutate: setSidePanelEnabled } = useSetIsSidePanelEnabledMutation()

  const handleToggle = async () => {
    if (!isSidePanelEnabled) {
      setSidePanelEnabled(true)
      const result = await attempt(switchToSidePanel)
      const opened = 'data' in result && result.data
      if (!opened) {
        setSidePanelEnabled(false)
        return
      }
      window.close()
    } else {
      await attempt(switchToPopup)
      setSidePanelEnabled(false)
      window.close()
    }
  }

  return (
    <ListItem
      icon={
        <ListItemIconWrapper>
          <PanelRightIcon />
        </ListItemIconWrapper>
      }
      extra={<Switch checked={isSidePanelEnabled} />}
      onClick={handleToggle}
      title={t('open_as_side_panel')}
      hoverable
    />
  )
}
