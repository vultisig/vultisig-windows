import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { TFunction } from 'i18next'

export const isBase64Encoded = (str: string): boolean => {
  // Regular expression to check if the string is base64
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

  // Check if the string matches the base64 pattern
  return base64Regex.test(str)
}

export function generateRandomNumber(): number {
  return Math.floor(Math.random() * 900) + 100
}

export const getVaultTypeText = (signersLength: number, t: TFunction) => {
  const threshold = getKeygenThreshold(signersLength)

  return t('m_of_n_vault', { n: signersLength, m: threshold })
}
