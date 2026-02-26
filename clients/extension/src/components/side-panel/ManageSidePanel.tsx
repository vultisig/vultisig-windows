import {
  useIsSidePanelEnabledQuery,
  useSetIsSidePanelEnabledMutation,
} from '@clients/extension/src/storage/isSidePanelEnabled'
import { ListItemIconWrapper } from '@core/ui/vault/settings'
import { PanelRightIcon } from '@lib/ui/icons/PanelRightIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

const switchToSidePanel = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  if (currentWindow.id == null) return

  await chrome.sidePanel.open({ windowId: currentWindow.id })

  await new Promise(resolve => setTimeout(resolve, 500))

  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['SIDE_PANEL' as chrome.runtime.ContextType],
  })

  if (contexts.length === 0) return

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
      const opened = await switchToSidePanel()
      if (!opened) return

      setSidePanelEnabled(true)
      window.close()
    } else {
      await switchToPopup()
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
