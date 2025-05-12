import { CoreView } from '@core/ui/navigation/CoreView'

export type AppView =
  | CoreView
  | { id: 'importVaultFromFile'; state: { filePath: string } }
  | { id: 'shareVault' }
  | { id: 'migrateVault' }
  | { id: 'vaultSettings' }
  | { id: 'manageVaults' }
  | { id: 'editVault' }
  | { id: 'vaultBackup' }
  | { id: 'vaultDelete' }
  | { id: 'checkUpdate' }
  | { id: 'addressBook' }
  | { id: 'faq' }
  | { id: 'vaultFAQ' }
  | { id: 'signCustomMessage' }
  | { id: 'registerForAirdrop' }
  | { id: 'onboarding' }
  | { id: 'createVaultFolder' }
  | { id: 'vaultFolder'; state: { id: string } }
  | { id: 'manageVaultFolder'; state: { id: string } }
  | { id: 'deeplink'; state: { url: string } }
  | { id: 'dkls' }

export type AppViewId = AppView['id']
