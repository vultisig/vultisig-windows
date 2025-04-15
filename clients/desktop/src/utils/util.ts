import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { TFunction } from 'i18next'

export const getVaultTypeText = (signersLength: number, t: TFunction) => {
  const threshold = getKeygenThreshold(signersLength)

  return t('m_of_n_vault', { n: signersLength, m: threshold })
}
