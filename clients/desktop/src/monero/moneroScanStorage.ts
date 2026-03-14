import {
  MoneroScanData,
  MoneroScanStorage,
} from '@core/chain/chains/monero/moneroScanStorage'

import {
  GetMoneroScanData,
  SaveMoneroScanData,
} from '../../wailsjs/go/storage/Store'

export const desktopMoneroScanStorage: MoneroScanStorage = {
  load: async (publicKeyEcdsa: string): Promise<MoneroScanData | null> => {
    const raw = await GetMoneroScanData(publicKeyEcdsa)
    if (!raw) return null
    return {
      address: raw.address,
      publicKeyEcdsa: raw.public_key_ecdsa,
      scanHeight: raw.scan_height ?? null,
      scanTarget: raw.scan_target ?? null,
      birthHeight: raw.birth_height ?? null,
      birthdayScanDone: raw.birthday_scan_done,
      balance: raw.balance,
      walletKeysData: raw.wallet_keys_data ?? undefined,
      walletCacheData: raw.wallet_cache_data ?? undefined,
      outputs: JSON.parse(raw.outputs_json || '[]'),
    }
  },
  save: async (data: MoneroScanData): Promise<void> => {
    await SaveMoneroScanData({
      address: data.address,
      public_key_ecdsa: data.publicKeyEcdsa,
      scan_height: data.scanHeight ?? undefined,
      scan_target: data.scanTarget ?? undefined,
      birth_height: data.birthHeight ?? undefined,
      birthday_scan_done: data.birthdayScanDone,
      balance: data.balance,
      wallet_keys_data: data.walletKeysData ?? undefined,
      wallet_cache_data: data.walletCacheData ?? undefined,
      outputs_json: JSON.stringify(data.outputs ?? []),
    } as never)
  },
}
