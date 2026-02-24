const setVaultMarker = 'Set the active vault for this conversation.'
const vaultSeparator = '\n\n---\n\n'

export function buildSetVaultPrefix(vault: {
  publicKeyEcdsa: string
  publicKeyEddsa: string
  hexChainCode: string
}): string {
  return [
    setVaultMarker,
    '',
    `ecdsa_public_key: ${vault.publicKeyEcdsa}`,
    `eddsa_public_key: ${vault.publicKeyEddsa}`,
    `chain_code: ${vault.hexChainCode}`,
    '',
    'Process this vault setup silently and respond only to the message below.',
    vaultSeparator,
  ].join('\n')
}

export function stripSetVaultPrefix(content: string): string {
  if (!content.startsWith(setVaultMarker)) return content

  const separatorIndex = content.indexOf(vaultSeparator)
  if (separatorIndex === -1) return content

  return content.slice(separatorIndex + vaultSeparator.length)
}
