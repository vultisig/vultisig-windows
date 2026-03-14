import {
  ZcashScanData,
  ZcashScanStorage,
} from '@core/chain/chains/zcash/zcashScanStorage'

import {
  GetZcashScanData,
  SaveZcashScanData,
} from '../../wailsjs/go/storage/Store'

export const desktopZcashScanStorage: ZcashScanStorage = {
  load: async (publicKeyEcdsa: string): Promise<ZcashScanData | null> => {
    const raw = await GetZcashScanData(publicKeyEcdsa)
    if (!raw) return null
    return {
      zAddress: raw.z_address,
      publicKeyEcdsa: raw.public_key_ecdsa,
      scanHeight: raw.scan_height ?? null,
      scanTarget: raw.scan_target ?? null,
      birthHeight: raw.birth_height ?? null,
      birthdayScanDone: raw.birthday_scan_done,
      pubKeyPackage: raw.pub_key_package,
      saplingExtras: raw.sapling_extras,
      notes: JSON.parse(raw.notes_json || '[]'),
      nullifierVersion: raw.nullifier_version ?? undefined,
    }
  },
  save: async (data: ZcashScanData): Promise<void> => {
    await SaveZcashScanData({
      z_address: data.zAddress,
      public_key_ecdsa: data.publicKeyEcdsa,
      scan_height: data.scanHeight ?? undefined,
      scan_target: data.scanTarget ?? undefined,
      birth_height: data.birthHeight ?? undefined,
      birthday_scan_done: data.birthdayScanDone,
      pub_key_package: data.pubKeyPackage,
      sapling_extras: data.saplingExtras,
      notes_json: JSON.stringify(data.notes),
      nullifier_version: data.nullifierVersion ?? undefined,
    } as never)
  },
}
