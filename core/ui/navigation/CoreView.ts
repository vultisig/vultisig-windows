import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'

export type CoreView =
  | { id: 'address'; state: { address: string } }
  | { id: 'airdropRegister' }
  | { id: 'currencySettings' }
  | { id: 'deleteVault' }
  | { id: 'deposit'; state: { coin: CoinKey } }
  | { id: 'importVault' }
  | {
      id: 'joinKeygen'
      state: {
        keygenType: KeygenType
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
      }
    }
  | { id: 'languageSettings' }
  | { id: 'manageVaultChains' }
  | { id: 'manageVaultChainCoins'; state: { chain: Chain } }
  | { id: 'vaultChainDetail'; state: { chain: Chain } }
  | { id: 'vaultChainCoinDetail'; state: { coin: CoinKey } }
  | { id: 'newVault' }
  | { id: 'renameVault' }
  | { id: 'reshareVault' }
  | { id: 'reshareVaultFast' }
  | { id: 'reshareVaultSecure' }
  | { id: 'settings' }
  | { id: 'setupFastVault' }
  | { id: 'setupSecureVault' }
  | { id: 'setupVault'; state: { type?: VaultSecurityType } }
  | { id: 'uploadQr'; state: { title?: string } }
  | { id: 'vault' }
  | { id: 'vaultDetails' }
  | { id: 'vaults' }
  | { id: 'send'; state: { coin: CoinKey; address?: string } }
  | { id: 'swap'; state: { coin: CoinKey } }
  | { id: 'createVaultFolder' }
  | { id: 'vaultFolder'; state: { id: string } }
  | { id: 'manageVaultFolder'; state: { id: string } }
  | { id: 'vaultSettings' }
  | { id: 'manageVaults' }
  | { id: 'addressBook' }
export type CoreViewId = CoreView['id']

export const initialCoreView: CoreView = {
  id: 'vault',
}
