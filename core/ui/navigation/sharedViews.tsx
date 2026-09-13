import { CoreViewId } from '@core/ui/navigation/CoreView'
import { ViewLoaders } from '@lib/ui/navigation/ViewLoaders'

import { currentProductBrand } from '../product/brand'

export type SharedViewId = Extract<
  CoreViewId,
  | 'agent'
  | 'agentChat'
  | 'addCustomToken'
  | 'address'
  | 'addressBook'
  | 'createAddressBookItem'
  | 'createVaultFolder'
  | 'chooseVaults'
  | 'currencySettings'
  | 'deeplink'
  | 'defi'
  | 'defiChainDetail'
  | 'deleteVault'
  | 'deposit'
  | 'languageSettings'
  | 'manageDefiChains'
  | 'manageDefiPositions'
  | 'kaminoDeposit'
  | 'kaminoWithdraw'
  | 'tonStake'
  | 'limitOrders'
  | 'cancelLimitOrder'
  | 'lpPositionForm'
  | 'manageVaultChainCoins'
  | 'manageVaultChains'
  | 'manageVaultFolder'
  | 'manageVaults'
  | 'newVault'
  | 'renameVault'
  | 'reshareVault'
  | 'send'
  | 'setupVaultOverview'
  | 'signCustomMessage'
  | 'swap'
  | 'updateAddressBookItem'
  | 'updateVaultFolder'
  | 'uploadQr'
  | 'vault'
  | 'vaultBackup'
  | 'vaultsBackup'
  | 'selectVaultsBackup'
  | 'vaultChainDetail'
  | 'vaultDetails'
  | 'vaultFolder'
  | 'vaultSettings'
  | 'vaultSettingsAdvanced'
  | 'customRpc'
  | 'customRpcDetail'
  | 'vaults'
  | 'managePasscodeEncryption'
  | 'passcodeAutoLock'
  | 'referral'
  | 'requestFastVaultBackup'
  | 'transactionDetail'
  | 'transactionHistory'
  | 'faq'
  | 'vultDiscount'
  | 'qbtcClaim'
  | 'qbtcQuantumSecurityOnboarding'
  | 'qbtcGovernanceProposal'
  | 'qbtcGovernanceVote'
>

/**
 * Loaders for the views both clients share. Every page stays behind a dynamic
 * import so the entry chunk only carries the shell and the home screen; clients
 * turn these into components with `lazyViews` and warm them with
 * `prefetchViews` once home has painted.
 */
export const sharedViewLoaders: ViewLoaders<SharedViewId> = {
  agent: () =>
    import('@core/ui/agent/components/AgentPage').then(
      ({ AgentPage }) => AgentPage
    ),
  agentChat: () =>
    import('@core/ui/agent/components/AgentChatPage').then(
      ({ AgentChatPage }) => AgentChatPage
    ),
  referral: () =>
    import('../vault/settings/referral/ReferralView').then(
      ({ ReferralView }) => ReferralView
    ),
  addCustomToken: () =>
    import('@core/ui/chain/coin/addCustomToken/AddCustomTokenPage').then(
      ({ AddCustomTokenPage }) => AddCustomTokenPage
    ),
  address: () =>
    import('@core/ui/chain/coin/address').then(
      ({ AddressPage }) => AddressPage
    ),
  addressBook: () =>
    import('@core/ui/address-book').then(
      ({ AddressBookPage }) => AddressBookPage
    ),
  createAddressBookItem: () =>
    import('@core/ui/address-book/create').then(
      ({ CreateAddressBookItemPage }) => CreateAddressBookItemPage
    ),
  createVaultFolder: () =>
    import('@core/ui/vaultsOrganisation/folder/create').then(
      ({ CreateVaultFolderPage }) => CreateVaultFolderPage
    ),
  chooseVaults: () =>
    import('@core/ui/notifications/choose-vaults/ChooseVaultsView').then(
      ({ ChooseVaultsView }) => ChooseVaultsView
    ),
  currencySettings: () =>
    import('@core/ui/preferences/currency').then(
      ({ CurrencyPage }) => CurrencyPage
    ),
  deeplink: () =>
    import('@core/ui/deeplink/components/DeeplinkPage').then(
      ({ DeeplinkPage }) => DeeplinkPage
    ),
  defi: () => import('../defi/page/DefiPage').then(({ DefiPage }) => DefiPage),
  defiChainDetail: () =>
    import('../defi/chain/DefiChainPage').then(
      ({ DefiChainPage }) => DefiChainPage
    ),
  deleteVault: () =>
    import('@core/ui/vault/settings/delete').then(
      ({ DeleteVaultPage }) => DeleteVaultPage
    ),
  deposit: () =>
    import('../vault/deposit/DepositView').then(
      ({ DepositView }) => DepositView
    ),
  languageSettings: () =>
    import('@core/ui/preferences/language').then(
      ({ LanguagePage }) => LanguagePage
    ),
  manageDefiChains: () =>
    import('../defi/manage/ManageDefiChainsPage').then(
      ({ ManageDefiChainsPage }) => ManageDefiChainsPage
    ),
  manageDefiPositions: () =>
    import('../defi/chain/manage/ManageDefiPositionsPage').then(
      ({ ManageDefiPositionsPage }) => ManageDefiPositionsPage
    ),
  kaminoDeposit: () =>
    import('@core/ui/defi/chain/solana/kamino/deposit/KaminoDepositPage').then(
      ({ KaminoDepositPage }) => KaminoDepositPage
    ),
  kaminoWithdraw: () =>
    import('@core/ui/defi/chain/solana/kamino/withdraw/KaminoWithdrawPage').then(
      ({ KaminoWithdrawPage }) => KaminoWithdrawPage
    ),
  tonStake: () =>
    import('@core/ui/chain/ton/staking/TonStakePage').then(
      ({ TonStakePage }) => TonStakePage
    ),
  lpPositionForm: () =>
    import('../defi/chain/LpPositionFormPage').then(
      ({ LpPositionFormPage }) => LpPositionFormPage
    ),
  manageVaultChains: () =>
    import('@core/ui/vault/chain/manage').then(
      ({ ManageVaultChainsPage }) => ManageVaultChainsPage
    ),
  manageVaultChainCoins: () =>
    import('@core/ui/vault/chain/manage/coin').then(
      ({ ManageVaultChainCoinsPage }) => ManageVaultChainCoinsPage
    ),
  manageVaults: () =>
    import('@core/ui/vaultsOrganisation/manage').then(
      ({ ManageVaultsPage }) => ManageVaultsPage
    ),
  newVault: () =>
    import('@core/ui/vault/new').then(({ NewVaultPage }) => NewVaultPage),
  renameVault: () =>
    import('@core/ui/vault/settings/rename').then(
      ({ VaultRenamePage }) => VaultRenamePage
    ),
  reshareVault: () =>
    import('@core/ui/mpc/keygen/reshare/ReshareVaultPage').then(
      ({ ReshareVaultPage }) => ReshareVaultPage
    ),
  send: () =>
    import('@core/ui/vault/send/SendPage').then(({ SendPage }) => SendPage),
  setupVaultOverview: () =>
    import('@core/ui/vault/create/setup-vault/SetupVaultOverviewPage').then(
      ({ SetupVaultOverviewPage }) => SetupVaultOverviewPage
    ),
  signCustomMessage: () =>
    import('@core/ui/vault/keysign/custom-message').then(
      ({ SignCustomMessagePage }) => SignCustomMessagePage
    ),
  swap: () =>
    import('@core/ui/vault/swap/components/SwapPage').then(
      ({ SwapPage }) => SwapPage
    ),
  updateAddressBookItem: () =>
    import('@core/ui/address-book/update').then(
      ({ UpdateAddressBookItemPage }) => UpdateAddressBookItemPage
    ),
  updateVaultFolder: () =>
    import('@core/ui/vaultsOrganisation/folder/update/UpdateVaultFolderView').then(
      ({ UpdateVaultFolderView }) => UpdateVaultFolderView
    ),
  uploadQr: () =>
    import('@core/ui/qr/upload').then(({ UploadQrPage }) => UploadQrPage),
  vault: () => import('@core/ui/vault/page').then(({ VaultPage }) => VaultPage),
  vaultBackup: () =>
    import('@core/ui/vault/backup').then(
      ({ VaultBackupPage }) => VaultBackupPage
    ),
  vaultsBackup: () =>
    import('@core/ui/vault/backup/VaultsBackupPage').then(
      ({ VaultsBackupPage }) => VaultsBackupPage
    ),
  selectVaultsBackup: () =>
    import('@core/ui/vault/backup/select/SelectVaultsBackupPage').then(
      ({ SelectVaultsBackupPage }) => SelectVaultsBackupPage
    ),
  vaultChainDetail: () =>
    import('@core/ui/vault/chain/VaultChainPage').then(
      ({ VaultChainPage }) => VaultChainPage
    ),
  vaultDetails: () =>
    import('@core/ui/vault/settings/details').then(
      ({ VaultDetailsPage }) => VaultDetailsPage
    ),
  vaultFolder: () =>
    import('@core/ui/vaultsOrganisation/folder/VaultFolderView').then(
      ({ VaultFolderView }) => VaultFolderView
    ),
  vaultSettings: () =>
    import('@core/ui/vault/settings').then(
      ({ VaultSettingsPage }) => VaultSettingsPage
    ),
  vaultSettingsAdvanced: () =>
    import('@core/ui/vault/settings/advanced').then(
      ({ VaultSettingsAdvancedPage }) => VaultSettingsAdvancedPage
    ),
  customRpc: () =>
    import('@core/ui/vault/settings/advanced/customRpc').then(
      ({ CustomRpcPage }) => CustomRpcPage
    ),
  customRpcDetail: () =>
    import('@core/ui/vault/settings/advanced/customRpc/CustomRpcDetailPage').then(
      ({ CustomRpcDetailPage }) => CustomRpcDetailPage
    ),
  vaults: () =>
    import('@core/ui/vaultsOrganisation').then(({ VaultsPage }) => VaultsPage),
  managePasscodeEncryption: () =>
    import('../passcodeEncryption/manage/ManagePasscodeEncryptionPage').then(
      ({ ManagePasscodeEncryptionPage }) => ManagePasscodeEncryptionPage
    ),
  passcodeAutoLock: () =>
    import('../passcodeEncryption/autoLock/PasscodeAutoLockPage').then(
      ({ PasscodeAutoLockPage }) => PasscodeAutoLockPage
    ),
  requestFastVaultBackup: () =>
    import('../vault/backup/fast/request').then(
      ({ RequestFastVaultBackup }) => RequestFastVaultBackup
    ),
  transactionDetail: () =>
    import('@core/ui/transaction-history/detail/TransactionDetailPage').then(
      ({ TransactionDetailPage }) => TransactionDetailPage
    ),
  transactionHistory: () =>
    import('@core/ui/transaction-history/TransactionHistoryPage').then(
      ({ TransactionHistoryPage }) => TransactionHistoryPage
    ),
  limitOrders: () =>
    import('@core/ui/vault/swap/limit/orders/LimitOrdersPage').then(
      ({ LimitOrdersPage }) => LimitOrdersPage
    ),
  cancelLimitOrder: () =>
    import('@core/ui/vault/swap/limit/cancel/CancelLimitOrderPage').then(
      ({ CancelLimitOrderPage }) => CancelLimitOrderPage
    ),
  faq: () =>
    import('../vault/settings/vaultFaq/FaqVaultPage').then(
      ({ FaqVaultPage }) => FaqVaultPage
    ),
  vultDiscount: () =>
    currentProductBrand === 'station'
      ? import('@core/ui/vault/page').then(({ VaultPage }) => VaultPage)
      : import('../vult/discount/page').then(
          ({ VultDiscountPage }) => VultDiscountPage
        ),
  qbtcClaim: () =>
    import('../qbtc/claim/components/QbtcClaimPage').then(
      ({ QbtcClaimPage }) => QbtcClaimPage
    ),
  qbtcQuantumSecurityOnboarding: () =>
    import('../qbtc/onboarding/QuantumSecurityOnboardingPage').then(
      ({ QuantumSecurityOnboardingPage }) => QuantumSecurityOnboardingPage
    ),
  qbtcGovernanceProposal: () =>
    import('../qbtc/governance/components/QbtcGovernanceProposalPage').then(
      ({ QbtcGovernanceProposalPage }) => QbtcGovernanceProposalPage
    ),
  qbtcGovernanceVote: () =>
    import('../qbtc/governance/components/QbtcGovernanceVotePage').then(
      ({ QbtcGovernanceVotePage }) => QbtcGovernanceVotePage
    ),
}
