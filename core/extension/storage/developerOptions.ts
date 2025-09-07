import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const storageKey = 'developerOptions'

const initialValues: DeveloperOptions = {
  pluginMarketplaceBaseUrl: 'https://store.vultisigplugin.app/api',
}

export const getDeveloperOptions = () =>
  getStorageValue<DeveloperOptions>(storageKey, initialValues)

export const setDeveloperOptions = async (options: DeveloperOptions) => {
  await setStorageValue(storageKey, options)
}

export type DeveloperOptions = {
  pluginMarketplaceBaseUrl: string
}
