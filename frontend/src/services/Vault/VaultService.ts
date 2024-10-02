import { Timestamp } from '@bufbuild/protobuf';
import { WalletCore } from '@trustwallet/wallet-core'; ///
import crypto from 'crypto';

import { SaveFileBkp } from '../../../wailsjs/go/main/App';
import { storage } from '../../../wailsjs/go/models';
import {
  DeleteAddressBookItem,
  GetAllAddressBookItems,
  GetSettings,
  SaveAddressBookItem,
  SaveSettings,
  SaveVault,
  UpdateAddressBookItem,
  UpdateVaultName,
} from '../../../wailsjs/go/storage/Store';
import { Reshare, StartKeygen } from '../../../wailsjs/go/tss/TssService';
import { VaultContainer } from '../../gen/vultisig/vault/v1/vault_container_pb';
import { Vault, Vault_KeyShare } from '../../gen/vultisig/vault/v1/vault_pb';
import {
  AddAddressBookItem,
  AddressBookItem,
} from '../../lib/types/address-book';
import { DefaultCoinsService } from '../Coin/DefaultCoinsService';
import { IVaultService } from './IVaultService';

export class VaultService implements IVaultService {
  private walletCore: WalletCore;
  constructor(walletCore: WalletCore) {
    this.walletCore = walletCore;
  }

  async getVaultSettings(): Promise<storage.Settings[]> {
    return await GetSettings();
  }

  async updateVaultSettings(settings: storage.Settings): Promise<void> {
    await SaveSettings(settings);
  }

  async deleteAddressBookItem(id: string): Promise<void> {
    await DeleteAddressBookItem(id);
  }

  async updateAddressBookItem(item: AddressBookItem): Promise<void> {
    await UpdateAddressBookItem(item as any);
  }

  async saveAddressBookItem(item: AddAddressBookItem): Promise<void> {
    await SaveAddressBookItem(item as any);
  }

  async getAllAddressBookItems(): Promise<storage.AddressBookItem[]> {
    return await GetAllAddressBookItems();
  }

  // public key ECDSA is the unique identifier for a vault - Vault Id
  async renameVault(
    vault: Vault | storage.Vault,
    newName: string
  ): Promise<void> {
    let vaultId = '';
    if (vault instanceof Vault) {
      vaultId = vault.publicKeyEcdsa;
    } else {
      vaultId = vault.public_key_ecdsa;
    }

    if (vaultId === '') {
      throw new Error('Vault ID is empty');
    }

    await UpdateVaultName(vaultId, newName);
  }

  async startKeygen(
    vault: any,
    sessionID: any,
    hexEncryptionKey: any,
    serverURL: any
  ): Promise<storage.Vault> {
    const newVault = await StartKeygen(
      vault.name,
      vault.local_party_id,
      sessionID,
      vault.hex_chain_code,
      hexEncryptionKey,
      serverURL
    );

    await SaveVault(newVault);

    new DefaultCoinsService(this.walletCore).applyDefaultCoins(newVault);

    return newVault;
  }

  async reshare(
    vault: any,
    sessionID: any,
    hexEncryptionKey: any,
    serverURL: any
  ): Promise<storage.Vault> {
    const newVault = await Reshare(
      vault,
      sessionID,
      hexEncryptionKey,
      serverURL
    );

    await SaveVault(newVault);

    new DefaultCoinsService(this.walletCore).applyDefaultCoins(newVault);

    return newVault;
  }

  async importVault(buffer: Buffer) {
    const vault = Vault.fromBinary(buffer);
    const storageVault = {
      name: vault.name,
      public_key_ecdsa: vault.publicKeyEcdsa,
      public_key_eddsa: vault.publicKeyEddsa,
      signers: vault.signers,
      created_at: vault.createdAt,
      hex_chain_code: vault.hexChainCode,
      keyshares: vault.keyShares.map(share => ({
        public_key: share.publicKey,
        keyshare: share.keyshare,
      })),
      local_party_id: vault.localPartyId,
      reshare_prefix: vault.resharePrefix,
      order: 0,
      is_backed_up: true,
      coins: [],
      convertValues: () => {},
    };
    await SaveVault(storageVault);
    new DefaultCoinsService(this.walletCore).applyDefaultCoins(storageVault);
  }

  encryptVault(passwd: string, vault: Buffer): Buffer {
    // Hash the password to create a key
    const key = crypto.createHash('sha256').update(passwd).digest();

    // Generate a random nonce (12 bytes for GCM)
    const nonce = crypto.randomBytes(12);

    // Create a new AES cipher using the key and nonce
    const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);

    // Encrypt the vault
    const ciphertext = Buffer.concat([cipher.update(vault), cipher.final()]);

    // Get the authentication tag (16 bytes)
    const authTag = cipher.getAuthTag();

    // Combine nonce, ciphertext, and authTag into a single buffer
    return Buffer.concat([nonce, ciphertext, authTag]);
  }

  decryptVault(passwd: string, vault: Buffer): Buffer {
    // Hash the password to create a key
    const key = crypto.createHash('sha256').update(passwd).digest();

    // Create a new AES cipher using the key
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      vault.slice(0, 12) // Nonce is the first 12 bytes
    );

    const ciphertext = vault.slice(12, -16); // Exclude the nonce and the auth tag
    const authTag = vault.slice(-16); // Last 16 bytes is the auth tag

    // Set the authentication tag
    decipher.setAuthTag(authTag);

    // Decrypt the vault
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted;
  }

  async createAndSaveBackup(
    vault: Vault | storage.Vault,
    password: string
  ): Promise<void> {
    const base64Data = await this.createBackup(vault, password);
    SaveFileBkp(this.getExportName(vault), base64Data);
  }

  async createBackup(
    vault: Vault | storage.Vault,
    password: string
  ): Promise<string> {
    if (vault instanceof Vault) {
      return await this.createBackupProto(vault, password);
    }

    return await this.createBackupProto(
      this.storageToProtoVault(vault),
      password
    );
  }

  async createBackupProto(vault: Vault, password: string): Promise<string> {
    // Step 1: Serialize the vault to binary (Uint8Array)
    const vaultData = vault.toBinary();

    // Step 2: Prepare VaultContainer
    const vaultContainer = new VaultContainer();
    vaultContainer.version = BigInt(1); // Current version

    // Convert serialized vault to Base64
    vaultContainer.vault = Buffer.from(vaultData).toString('base64');

    // Step 3: Encrypt if password is provided
    if (password) {
      vaultContainer.isEncrypted = true;
      const encryptedVault = this.encryptVault(
        password,
        Buffer.from(vaultData)
      ); // Encrypt as buffer
      vaultContainer.vault = encryptedVault.toString('base64'); // Store encrypted vault as Base64 string
    } else {
      vaultContainer.isEncrypted = false;
    }

    // Step 4: Serialize VaultContainer to binary
    const vaultContainerData = vaultContainer.toBinary();

    // Step 5: Return Base64-encoded .bak file content
    return Buffer.from(vaultContainerData).toString('base64');
  }

  storageToProtoVault(storageVault: storage.Vault): Vault {
    // Convert created_at to proto Timestamp if available
    const createdAtTimestamp = storageVault.created_at
      ? Timestamp.fromDate(new Date(storageVault.created_at))
      : undefined;

    // Convert KeyShares to proto format
    const keyShares = storageVault.keyshares.map(keyShare => {
      const protoKeyShare = new Vault_KeyShare({
        publicKey: keyShare.public_key,
        keyshare: keyShare.keyshare,
      });
      return protoKeyShare;
    });

    // Construct proto Vault
    const protoVault = new Vault({
      name: storageVault.name,
      publicKeyEcdsa: storageVault.public_key_ecdsa,
      publicKeyEddsa: storageVault.public_key_eddsa,
      signers: storageVault.signers,
      createdAt: createdAtTimestamp,
      hexChainCode: storageVault.hex_chain_code,
      keyShares: keyShares,
      localPartyId: storageVault.local_party_id,
      resharePrefix: storageVault.reshare_prefix,
    });

    return protoVault;
  }

  getExportName(vault: Vault | storage.Vault): string {
    const currentDate = new Date();
    const formattedDate = this.formatDate(currentDate);

    const totalSigners = vault.signers.length;
    const threshold = this.getThreshold(totalSigners);
    const lastFourOfPubKey = this.getLastFourCharacters(
      vault instanceof Vault ? vault.publicKeyEcdsa : vault.public_key_ecdsa
    );
    const localPartyId =
      vault instanceof Vault ? vault.localPartyId : vault.local_party_id;

    return `vultisig-${vault.name}-${formattedDate}-${threshold + 1}of${totalSigners}-${lastFourOfPubKey}-${localPartyId}.bak`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
    return `${year}-${month}`;
  }

  private getThreshold(totalSigners: number): number {
    return Math.ceil((totalSigners * 2) / 3) - 1;
  }

  private getLastFourCharacters(pubKey: string): string {
    return pubKey.slice(-4);
  }
}
