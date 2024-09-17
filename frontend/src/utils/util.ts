import { TFunction } from 'i18next';

export const isBase64Encoded = (str: string): boolean => {
  // Regular expression to check if the string is base64
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  // Check if the string matches the base64 pattern
  return base64Regex.test(str);
};

export function generateRandomNumber(): number {
  return Math.floor(Math.random() * 900) + 100;
}

export const getVaultTypeText = (
  m: number,
  t: TFunction<'translation', undefined>
) => {
  let vaultTypeText;

  const n = 2; // Assuming n is 2 in this case for simplicity
  if (m > 3) {
    vaultTypeText = t('m_of_n_vault', { n, m });
  } else {
    // Handle specific cases like 2 of 2, 2 of 3 vaults
    vaultTypeText = t(`2_of_${m}_vault`);
  }

  return vaultTypeText;
};
