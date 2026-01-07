import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { ChainWithTokenMetadataDiscovery } from '@core/chain/coin/token/metadata/chains'
import { KeygenOperation } from '@core/mpc/keygen/KeygenOperation'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { DefiProtocol } from '@core/ui/defi/protocols/core'
import { KeyImportInput } from '@core/ui/mpc/keygen/keyimport/state/keyImportInput'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'

export type CoreView =
  | { id: 'addCustomToken'; state: { chain: ChainWithTokenMetadataDiscovery } }
  | { id: 'address'; state: { address: string } }
  | { id: 'addressBook' }
  | { id: 'faq' }
  | { id: 'airdropRegister' }
  | {
      id: 'createAddressBookItem'
      state?: { address?: string; chain?: Chain }
    }
  | { id: 'createVaultFolder' }
  | { id: 'currencySettings' }
  | { id: 'deeplink'; state: { url: string } }
  | { id: 'deleteVault' }
  | {
      id: 'deposit'
      state: {
        coin: CoinKey
        action?: ChainAction
        form?: Record<string, any>
        entryPoint?: 'defi' | 'vault'
      }
    }
  | { id: 'referral' }
  | { id: 'importVault' }
  | { id: 'shareVault' }
  | {
      id: 'joinKeygen'
      state: {
        keygenOperation: KeygenOperation
        keygenMsg: KeygenMessage | ReshareMessage
      }
    }
  | {
      id: 'joinKeysign'
      state: { vaultId: string; keysignMsg: KeysignMessage }
    }
  | {
      id: 'keysign'
      state: {
        securityType: VaultSecurityType
        keysignPayload: KeysignMessagePayload
        password?: string
      }
    }
  | { id: 'languageSettings' }
  | { id: 'manageVaultChains' }
  | { id: 'manageVaultChainCoins'; state: { chain: Chain } }
  | { id: 'newVault' }
  | { id: 'importSeedphrase' }
  | { id: 'renameVault' }
  | { id: 'reshareVault' }
  | { id: 'reshareVaultFast' }
  | { id: 'reshareVaultSecure' }
  | { id: 'migrateVault' }
  | {
      id: 'send'
      state: ({ fromChain: Chain } | { coin: CoinKey }) & {
        address?: string
        amount?: bigint
        memo?: string
      }
    }
  | { id: 'settings' }
  | { id: 'setupFastVault'; state: { keyImportInput?: KeyImportInput } }
  | { id: 'setupSecureVault'; state: { keyImportInput?: KeyImportInput } }
  | {
      id: 'setupVault'
      state: { type?: VaultSecurityType; keyImportInput?: KeyImportInput }
    }
  | { id: 'signCustomMessage' }
  | { id: 'swap'; state: { fromCoin?: CoinKey; toCoin?: CoinKey } }
  | { id: 'updateAddressBookItem'; state: { id: string } }
  | { id: 'updateVaultFolder'; state: { id: string } }
  | { id: 'uploadQr'; state: { title?: string } }
  | { id: 'vault' }
  | { id: 'defi'; state: { protocol?: DefiProtocol } }
  | { id: 'defiChainDetail'; state: { chain: Chain; tab?: string } }
  | { id: 'manageDefiChains' }
  | { id: 'manageDefiPositions'; state: { chain: Chain; returnTab?: string } }
  | {
      id: 'lpPositionForm'
      state: { chain: Chain; positionId: string; action: 'add' | 'remove' }
    }
  | { id: 'vaultBackup' }
  | { id: 'vaultsBackup' }
  | { id: 'selectVaultsBackup' }
  | { id: 'vaultDetails' }
  | { id: 'vaultChainDetail'; state: { chain: Chain } }
  | { id: 'vaultFolder'; state: { id: string } }
  | { id: 'vaults' }
  | { id: 'vaultSettings' }
  | { id: 'manageVaults' }
  | { id: 'managePasscodeEncryption' }
  | { id: 'passcodeAutoLock' }
  | { id: 'requestFastVaultBackup' }
  | { id: 'vultDiscount' }

export type CoreViewId = CoreView['id']

export const initialCoreView: CoreView = {
  id: 'vault',
}

export type CoreViewState<T extends CoreView['id']> =
  Extract<CoreView, { id: T }> extends { state: infer S } ? S : never
