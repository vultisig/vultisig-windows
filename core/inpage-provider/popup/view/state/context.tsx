import { VaultAppSession } from '@core/extension/storage/appSessions'
import { BridgeContext } from '@lib/extension/bridge/context'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

type PopupViewContext =
  | (BridgeContext & { appSession?: VaultAppSession })
  | undefined

export const { provider: PopupContextProvider, useValue: usePopupContext } =
  getValueProviderSetup<PopupViewContext>('PopupContext')
