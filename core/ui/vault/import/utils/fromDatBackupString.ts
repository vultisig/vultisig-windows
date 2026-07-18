import {
  DatBackup,
  fromDatBackup,
} from '@core/ui/vault/import/utils/fromDatBackup'

export const fromDatBackupString = (value: string) => {
  const decodedString = Buffer.from(value, 'hex').toString('utf8')

  const parsed = JSON.parse(decodedString)

  // Older iOS/Android GG20 `.dat` exports wrap the vault fields inside a
  // `{ version, vault }` envelope, whereas the flat parser expects them at the
  // top level. Unwrap when present, and default libType to GG20 (these old
  // backups predate the libType field).
  const datBackup = (
    parsed && typeof parsed === 'object' && 'vault' in parsed
      ? parsed.vault
      : parsed
  ) as DatBackup

  return fromDatBackup({ ...datBackup, libType: datBackup.libType ?? 'GG20' })
}
