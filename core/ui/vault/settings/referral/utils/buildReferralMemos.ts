type CreateArgs = {
  name: string
  thorAliasAddress: string
  preferredAsset?: string
}

// ~:name:THOR:<thor-alias-address>:<owner-thor-addr>:?preferredAsset
export function buildCreateReferralMemo({
  name,
  thorAliasAddress,
  preferredAsset,
}: CreateArgs) {
  const parts = ['~', name, 'THOR', thorAliasAddress, thorAliasAddress]
  if (preferredAsset) parts.push(preferredAsset)
  return parts.join(':')
}

type RenewArgs = { name: string; thorAliasAddress: string }
// ~:name:THOR:<thor-alias-address>
export function buildRenewalMemo({ name, thorAliasAddress }: RenewArgs) {
  return ['~', name, 'THOR', thorAliasAddress].join(':')
}

type EditArgs = {
  name: string
  thorAliasAddress: string
  preferredAsset: string
}

// (Set preferred asset + keep THOR alias explicit)
export function buildSetPreferredAssetMemo({
  name,
  thorAliasAddress,
  preferredAsset,
}: EditArgs) {
  return [
    '~',
    name,
    'THOR',
    thorAliasAddress,
    thorAliasAddress,
    preferredAsset,
  ].join(':')
}
