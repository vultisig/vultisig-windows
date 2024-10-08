export const getVaultActionSignersMin = (signers: number) =>
  Math.ceil((signers * 2) / 3);
