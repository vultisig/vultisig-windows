export const getVaultParticipantInfoFormattedForUI = (vault: {
  signers: string[]
  localPartyId: string
}) => {
  const totalSigners = vault.signers.length
  const localPartyIndex = vault.signers.indexOf(vault.localPartyId) + 1
  return { localPartyIndex, totalSigners }
}
