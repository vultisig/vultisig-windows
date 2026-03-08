const prefix = 'VITE_FF_'

export const getFeatureFlagDefines = (env: Record<string, string>) => {
  const overrides: Record<string, boolean> = {}

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      const flagName = key.slice(prefix.length)
      overrides[flagName] = value === 'true'
    }
  }

  return {
    __FEATURE_FLAG_OVERRIDES__: JSON.stringify(overrides),
  }
}
