export type VaultExport = {
  uid: string
  name: string
  publicKeyEcdsa: string
  publicKeyEddsa: string
  publicKeyMldsa?: string
  hexChainCode: string
  isFastVault: boolean
  isKeyImportVault: boolean
  localPartyId: string
  parties: string[]
}
