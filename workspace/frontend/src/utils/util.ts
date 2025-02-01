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
  signersLength: number,
  t: TFunction<'translation', undefined>
) => {
  let vaultTypeText;

  const n = 2;
  if (signersLength > 3) {
    vaultTypeText = t('m_of_n_vault', { n, signersLength });
  } else {
    vaultTypeText = t(`2_of_${signersLength}_vault`);
  }

  return vaultTypeText;
};
