import type { ToolHandler } from '../types'

export const handleRenameVault: ToolHandler = async (input, context) => {
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  const newName = String(input.new_name ?? '').trim()
  if (!newName) throw new Error('new_name is required')
  if (newName.length < 2 || newName.length > 50) {
    throw new Error('Vault name must be 2-50 characters')
  }

  const vaults = await store.GetVaults()
  const duplicate = vaults.find(
    v => v.name === newName && v.publicKeyEcdsa !== context.vaultPubKey
  )
  if (duplicate) {
    throw new Error(`A vault named "${newName}" already exists`)
  }

  const vault = await store.GetVault(context.vaultPubKey)
  const oldName = vault.name
  vault.name = newName
  await store.SaveVault(vault)

  if (window.runtime) {
    window.runtime.EventsEmit('agent:vault-changed', {
      vaultPubKey: context.vaultPubKey,
    })
  }

  return {
    data: {
      success: true,
      old_name: oldName,
      new_name: newName,
      message: `Vault renamed from "${oldName}" to "${newName}"`,
    },
    vaultModified: true,
  }
}
