import { Chain } from '@core/chain/Chain'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'

export const corePaths = {
  address: '/address',
  currencySettings: '/settings/currency',
  defaultChains: '/settings/default-chains',
  deposit: '/vault/item/deposit',
  importVault: '/vault/import',
  joinKeygen: '/join-keygen',
  joinKeysign: '/join-keysign',
  keysign: '/vault/keysign',
  languageSettings: '/settings/language',
  manageVaultChains: '/vault/chains/manage',
  manageVaultChainCoins: '/vault/chains/coins',
  vaultChainDetail: '/vault/item/detail',
  vaultChainCoinDetail: '/vault/item/detail/coin',
  newVault: '/vault/new',
  renameVault: '/settings/vault/rename',
  reshareVault: '/vault/reshare',
  reshareVaultFast: '/vault/reshare/fast',
  reshareVaultSecure: '/vault/reshare/secure',
  setupFastVault: '/vault/setup/fast',
  setupSecureVault: '/vault/setup/secure',
  setupVault: '/vault/setup',
  uploadQr: '/vault/qr/upload',
  vault: '/',
  vaultDetails: '/vault/settings/details',
  vaults: '/vaults',
  send: '/vault/send',
  swap: '/vault/item/swap',
} as const

type CorePaths = typeof corePaths

export type CorePath = keyof CorePaths

export type CorePathState = {
  joinKeygen: {
    keygenType: KeygenType
    keygenMsg: KeygenMessage | ReshareMessage
  }
  keysign: {
    securityType: VaultSecurityType
    keysignPayload: KeysignMessagePayload
  }
  joinKeysign: { vaultId: string; keysignMsg: KeysignMessage }

  address: { address: string }
  deposit: { coin: string }
  setupVault: { type?: VaultSecurityType }
  manageVaultChainCoins: { chain: Chain }
  vaultChainDetail: { chain: Chain }
  vaultChainCoinDetail: { chain: Chain; coin: string }
  uploadQr: { title?: string }
  send: { coin: string; address?: string }
  swap: { coin: string }
}

export type CorePathsWithState = keyof CorePathState

export type CorePathsWithoutState = Exclude<CorePath, CorePathsWithState>
