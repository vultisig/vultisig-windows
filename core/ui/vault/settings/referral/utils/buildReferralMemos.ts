type CreateArgs = {
  name: string
  thorAliasAddress: string
  preferredAsset?: string
}

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
export function buildRenewalMemo({ name, thorAliasAddress }: RenewArgs) {
  return ['~', name, 'THOR', thorAliasAddress].join(':')
}

type EditArgs = {
  name: string
  thorAliasAddress: string
  preferredAsset: string
}

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
