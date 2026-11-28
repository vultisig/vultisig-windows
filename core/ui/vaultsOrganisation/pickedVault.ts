// Module scope because picking a vault remounts everything under
// RootCurrentVaultProvider while the new vault's shares are read.
let pickedVaultId: string | null = null

/** Records that the user picked this vault in the vault list. */
export const markVaultPicked = (vaultId: string) => {
  pickedVaultId = vaultId
}

/** Forgets a pick whose vault never became current. */
export const clearVaultPick = () => {
  pickedVaultId = null
}

/** The vault the user last picked in the vault list, returned once. */
export const takePickedVaultId = (): string | null => {
  const vaultId = pickedVaultId
  pickedVaultId = null
  return vaultId
}
