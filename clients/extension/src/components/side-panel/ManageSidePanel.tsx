import {
  useIsSidePanelEnabledQuery,
  useSetIsSidePanelEnabledMutation,
} from '@clients/extension/src/storage/isSidePanelEnabled'
import { ListItemIconWrapper } from '@core/ui/vault/settings'
import { PanelRightIcon } from '@lib/ui/icons/PanelRightIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'

const switchToSidePanel = async () => {
  if (!chrome.sidePanel) return false

  const currentWindow = await chrome.windows.getCurrent()
  if (currentWindow.id == null) return false

  // A non-throwing open() is our success signal: real failures (missing user
  // gesture, unsupported API) reject and are caught by the attempt() wrapper in
  // handleToggle. We intentionally do not gate on chrome.runtime.getContexts —
  // Chromium forks like Vivaldi open the panel but never report the SIDE_PANEL
  // context, which previously reverted the toggle despite a successful open.
  await chrome.sidePanel.open({ windowId: currentWindow.id })

  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  return true
}

const switchToPopup = async () => {
  await chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: false })
}

/**
 * Settings toggle that switches the extension between popup and side panel modes.
 * Returns null when the side panel API is unavailable (e.g. on Firefox).
 */
export const ManageSidePanel = () => {
  const { t } = useTranslation()
  const { data: isSidePanelEnabled } = useIsSidePanelEnabledQuery()
  const { mutateAsync: setSidePanelEnabled } =
    useSetIsSidePanelEnabledMutation()

  if (typeof chrome === 'undefined' || !chrome.sidePanel) return null

  const handleToggle = async () => {
    if (!isSidePanelEnabled) {
      await setSidePanelEnabled(true)
      const result = await attempt(switchToSidePanel)
      const opened = 'data' in result && result.data
      if (!opened) {
        await setSidePanelEnabled(false)
        return
      }
      window.close()
    } else {
      await attempt(switchToPopup)
      await setSidePanelEnabled(false)
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
