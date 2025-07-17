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
  preferredAsset: string
}) => `~:${name.toUpperCase()}:THOR:${thorAliasAddress}::${preferredAsset}`
