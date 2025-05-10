export type AppView =
  | { id: 'deleteVault' }
  | { id: 'onboarding' }
  | { id: 'settings' }
  | { id: 'vaultSettings' }
  | { id: 'connectedDapps' }
  | { id: 'connectTab' }
  | { id: 'vaultsTab' }
  | { id: 'transactionTab' }

export type AppViewId = AppView['id']
