import { currentExtensionBrandConfig } from '../../brand/extensionBrandConfig'

/** `@polkadot/extension-dapp` skips `injectedWeb3` entries without a string version. */
export const substrateExtensionVersion = '0.46.9'

type SubstrateEnable = NonNullable<Window['injectedWeb3']>[string]['enable']

/** Registers the wallet under its brand key; Substrate dApps such as taostats.io show that key as the wallet name. */
export const installSubstrateDiscovery = (enable: SubstrateEnable) => {
  window.injectedWeb3 ??= {}
  window.injectedWeb3[
    currentExtensionBrandConfig.provider.walletPickerIdentifier
  ] = { enable, version: substrateExtensionVersion }
}
