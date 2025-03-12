import { storage } from '../../../../../wailsjs/go/models'

export type UploadQRPageResult = { vault: storage.Vault } | { noVault: true }
