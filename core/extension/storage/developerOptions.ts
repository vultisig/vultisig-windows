import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const initialValues: DeveloperOptions = {
  pluginMarketplaceBaseUrl: 'https://verifier.vultisig.com',
  appInstallTimeout: 60000,
}

export const getDeveloperOptions = () =>
  getStorageValue<DeveloperOptions>(StorageKey.developerOptions, initialValues)

export const setDeveloperOptions = async (options: DeveloperOptions) => {
  await setStorageValue(StorageKey.developerOptions, options)
}

export type DeveloperOptions = {
  pluginMarketplaceBaseUrl: string
  appInstallTimeout: number
}
