export const getVaultParticipantInfoFormattedForUI = (vault: {
  signers: string[]
  local_party_id: string
}) => {
  const totalSigners = vault.signers.length
  const localPartyIndex = vault.signers.indexOf(vault.local_party_id) + 1
  return { localPartyIndex, totalSigners }
}
