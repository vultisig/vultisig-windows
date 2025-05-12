import { AddressPage } from '@core/ui/chain/components/address/AddressPage'
import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { DefaultChainsPage } from '@core/ui/preferences/default-chains'
import { LanguagePage } from '@core/ui/preferences/language'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { VaultChainCoinPage } from '@core/ui/vault/chain/coin/VaultChainCoinPage'
import { ManageVaultChainsPage } from '@core/ui/vault/chain/manage'
import { ManageVaultChainCoinsPage } from '@core/ui/vault/chain/manage/coin/ManageVaultChainCoinsPage'
import { VaultChainPage } from '@core/ui/vault/chain/VaultChainPage'
import { NewVaultPage } from '@core/ui/vault/new'
import { SendPage } from '@core/ui/vault/send/SendPage'
import { VaultDetailsPage } from '@core/ui/vault/settings/details'
import { VaultRenamePage } from '@core/ui/vault/settings/rename'
import { SwapPage } from '@core/ui/vault/swap/components/SwapPage'
import { CreateVaultFolderPage } from '@core/ui/vaultsOrganisation/folders/create/CreateVaultFolderPage'
import { Views } from '@lib/ui/navigation/Views'

import { ManageVaultFolderPage } from '../vaultsOrganisation/folder/manage/ManageVaultFolderPage'
import { VaultFolderPage } from '../vaultsOrganisation/folder/VaultFolderPage'
import { WrapWithVaultFolderContext } from '../vaultsOrganisation/folder/withVaultFolder'
import { CoreViewId } from './CoreView'

type SharedViewId = Extract<
  CoreViewId,
  | 'currencySettings'
  | 'defaultChains'
  | 'languageSettings'
  | 'newVault'
  | 'renameVault'
  | 'vaultDetails'
  | 'vaultChainDetail'
  | 'vaultChainCoinDetail'
  | 'manageVaultChainCoins'
  | 'address'
  | 'manageVaultChains'
  | 'reshareVault'
  | 'send'
  | 'swap'
  | 'createVaultFolder'
  | 'vaultFolder'
  | 'manageVaultFolder'
>

export const sharedViews: Views<SharedViewId> = {
  currencySettings: CurrencyPage,
  defaultChains: DefaultChainsPage,
  languageSettings: LanguagePage,
  manageVaultChains: () => (
    <ActiveVaultGuard>
      <ManageVaultChainsPage />
    </ActiveVaultGuard>
  ),
  newVault: NewVaultPage,
  renameVault: () => (
    <ActiveVaultGuard>
      <VaultRenamePage />
    </ActiveVaultGuard>
  ),
  reshareVault: () => (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
  vaultDetails: () => (
    <ActiveVaultGuard>
      <VaultDetailsPage />
    </ActiveVaultGuard>
  ),
  send: () => (
    <ActiveVaultGuard>
      <SendPage />
    </ActiveVaultGuard>
  ),
  swap: () => (
    <ActiveVaultGuard>
      <SwapPage />
    </ActiveVaultGuard>
  ),
  vaultChainDetail: () => (
    <ActiveVaultGuard>
      <VaultChainPage />
    </ActiveVaultGuard>
  ),
  vaultChainCoinDetail: () => (
    <ActiveVaultGuard>
      <VaultChainCoinPage />
    </ActiveVaultGuard>
  ),
  manageVaultChainCoins: () => (
    <ActiveVaultGuard>
      <ManageVaultChainCoinsPage />
    </ActiveVaultGuard>
  ),
  createVaultFolder: () => (
    <ActiveVaultGuard>
      <CreateVaultFolderPage />
    </ActiveVaultGuard>
  ),
  vaultFolder: () => (
    <WrapWithVaultFolderContext>
      <VaultFolderPage />
    </WrapWithVaultFolderContext>
  ),
  manageVaultFolder: () => (
    <WrapWithVaultFolderContext>
      <ManageVaultFolderPage />
    </WrapWithVaultFolderContext>
  ),
  address: () => <AddressPage />,
}
