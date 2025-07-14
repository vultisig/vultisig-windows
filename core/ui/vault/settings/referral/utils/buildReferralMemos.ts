export const buildCreateReferralMemo = ({
  name,
  payoutAddress,
  ownerThorAddr,
}: {
  name: string
  payoutAddress: string
  ownerThorAddr: string
}) => `~:${name.toUpperCase()}:THOR:${payoutAddress}:${ownerThorAddr}`

// export const buildRenewReferralMemo = (name: string, thorAliasAddr: string) =>
//   `~:${name.toUpperCase()}:THOR:${thorAliasAddr}`
