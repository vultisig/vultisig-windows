// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __FEATURE_FLAG_OVERRIDES__: Partial<FeatureFlags> | undefined

type FeatureFlags = typeof featureFlagDefaults

const featureFlagDefaults = {
  circle: true,
  nftTab: false,
  importSeedphrase: true,
  mayaChain: false,
  defiLpsTab: true,
  agent: false,
  mldsaKeygen: false,
  transactionHistory: true,
}

export const featureFlags: FeatureFlags = {
  ...featureFlagDefaults,
  ...(typeof __FEATURE_FLAG_OVERRIDES__ !== 'undefined'
    ? __FEATURE_FLAG_OVERRIDES__
    : {}),
}
