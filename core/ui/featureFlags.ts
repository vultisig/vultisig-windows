// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __FEATURE_FLAG_OVERRIDES__: Partial<FeatureFlags> | undefined

type FeatureFlags = typeof featureFlagDefaults

const featureFlagDefaults = {
  circle: true,
  nftTab: false,
  importSeedphrase: true,
  mayaChain: true,
  defiLpsTab: true,
  agent: false,
  mldsaKeygen: true,
  transactionHistory: true,
  // QBTC is pre-launch: keep it out of the DeFi tab (chain picker, DeFi home,
  // refresh, totals). Flip to re-enable. QBTC claim and governance stay intact.
  qbtcDefi: false,
}

export const featureFlags: FeatureFlags = {
  ...featureFlagDefaults,
  ...(typeof __FEATURE_FLAG_OVERRIDES__ !== 'undefined'
    ? __FEATURE_FLAG_OVERRIDES__
    : {}),
}
