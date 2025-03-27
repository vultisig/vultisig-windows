import { TFunction } from 'i18next'
import { z } from 'zod'

export const createVaultBackupSchema = (t: TFunction) =>
  z
    .object({
      password: z
        .string()
        .min(3, t('vault_backup_page_password_error'))
        .max(30),
      verifiedPassword: z
        .string()
        .min(3, 'Set a strong password and save it.')
        .max(30),
    })
    .refine(data => data.password === data.verifiedPassword, {
      message: t('vault_backup_page_verified_password_error'),
      path: ['verifiedPassword'],
    })

export type VaultBackupSchema = z.infer<
  ReturnType<typeof createVaultBackupSchema>
>
