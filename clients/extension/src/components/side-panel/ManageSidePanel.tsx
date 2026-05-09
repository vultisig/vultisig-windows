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

type ChromeSidePanel = {
  open: (options: { windowId: number }) => Promise<void>
  setPanelBehavior: (options: {
    openPanelOnActionClick: boolean
  }) => Promise<void>
}

type ChromeRuntimeWithContexts = typeof chrome.runtime & {
  ContextType?: { SIDE_PANEL: string }
  getContexts?: (options: { contextTypes: string[] }) => Promise<unknown[]>
}

const getSidePanel = (): ChromeSidePanel | undefined =>
  (chrome as unknown as { sidePanel?: ChromeSidePanel }).sidePanel

const getRuntimeWithContexts = (): ChromeRuntimeWithContexts =>
  chrome.runtime as ChromeRuntimeWithContexts

const switchToSidePanel = async () => {
  const sidePanel = getSidePanel()
  if (!sidePanel) return false

  const currentWindow = await chrome.windows.getCurrent()
  if (currentWindow.id == null) return false

  await sidePanel.open({ windowId: currentWindow.id })

  await new Promise(resolve => setTimeout(resolve, 500))

  const runtime = getRuntimeWithContexts()
  const sidePanelContextType = runtime.ContextType?.SIDE_PANEL
  const getContexts = (
    runtime as {
      getContexts?: (options: { contextTypes: string[] }) => Promise<unknown[]>
    }
  ).getContexts
  const contexts =
    getContexts && sidePanelContextType
      ? await getContexts({
          contextTypes: [sidePanelContextType],
        })
      : []

  if (contexts.length === 0) return false

  await sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  return true
}

const switchToPopup = async () => {
  await getSidePanel()?.setPanelBehavior({ openPanelOnActionClick: false })
}

export const ManageSidePanel = () => {
  const { t } = useTranslation()
  const { data: isSidePanelEnabled } = useIsSidePanelEnabledQuery()
  const { mutateAsync: setSidePanelEnabled } =
    useSetIsSidePanelEnabledMutation()

  if (typeof chrome === 'undefined' || !getSidePanel()) return null

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
