import { vaultConfig } from '@core/config'
import { TFunction } from 'i18next'
import { z } from 'zod'

export const getVaultNameSchema = (
  t: TFunction,
  existingVaultNames: string[]
) =>
  z
    .string()
    .min(1, t('vault_name_required'))
    .max(vaultConfig.maxNameLength, t('vault_name_max_length_error'))
    .refine(
      name => !existingVaultNames.includes(name),
      t('vault_name_already_exists')
    )
