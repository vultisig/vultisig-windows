export const buildCreateReferralMemo = ({
  name,
  payoutAddress,
  ownerThorAddr,
}: {
  name: string
  payoutAddress: string
  ownerThorAddr: string
}) => `~:${name.toUpperCase()}:THOR:${payoutAddress}:${ownerThorAddr}`

export const buildEditReferralMemo = ({
  name,
  thorAliasAddress,
  preferredAsset,
}: {
  name: string
  thorAliasAddress: string
  preferredAsset?: string
}) => {
  const upper = name.toUpperCase()
  const base = `~:${upper}:THOR:${thorAliasAddress}`
  // if they chose a new asset, add it; otherwise just renew
  return preferredAsset ? `${base}::${preferredAsset}` : base
}
