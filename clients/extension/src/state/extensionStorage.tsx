import { ChildrenProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import {
  getVaultsAppSessions,
  GetVaultsAppSessionsFunction,
  setVaultsAppSessions,
  SetVaultsAppSessionsFunction,
} from '../sessions/state/appSessions'

type ExtensionStorage = {
  setVaultsAppSessions: SetVaultsAppSessionsFunction
  getVaultsAppSessions: GetVaultsAppSessionsFunction
}

const extensionStorage: ExtensionStorage = {
  setVaultsAppSessions: setVaultsAppSessions,
  getVaultsAppSessions: getVaultsAppSessions,
}

export const { useValue: useExtensionStorage, provider: StorageProvider } =
  getValueProviderSetup<ExtensionStorage>('ExtensionStorage')

export const ExtensionStorageProvider = ({ children }: ChildrenProp) => {
  return <StorageProvider value={extensionStorage}>{children}</StorageProvider>
}
