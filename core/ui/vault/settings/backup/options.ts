export const backupOptionTypes = ['device', 'server'] as const
export type BackupOptionType = (typeof backupOptionTypes)[number]
