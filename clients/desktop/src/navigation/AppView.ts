import { CoreView } from '@core/ui/navigation/CoreView'

export type AppView =
  | CoreView
  | { id: 'addressBook' }
  | { id: 'checkUpdate' }
  | { id: 'createVaultFolder' }
  | { id: 'deeplink'; state: { url: string } }
  | { id: 'faq' }
  | { id: 'importVaultFromFile'; state: { filePath: string } }
  | { id: 'migrateVault' }
  | { id: 'onboarding' }
  | { id: 'shareVault' }
  | { id: 'signCustomMessage' }
  | { id: 'vaultBackup' }
  | { id: 'vaultFAQ' }
  | { id: 'vaultFolder'; state: { id: string } }

export type AppViewId = AppView['id']
