import { Timestamp } from '@bufbuild/protobuf';
import crypto from 'crypto';

import { SaveFileBkp } from '../../../wailsjs/go/main/App';
import { storage } from '../../../wailsjs/go/models';
import {
  DeleteAddressBookItem,
  GetAllAddressBookItems,
  GetSettings,
  SaveAddressBookItem,
  SaveSettings,
  UpdateAddressBookItem,
  UpdateVaultName,
} from '../../../wailsjs/go/storage/Store';
import { VaultContainer } from '../../gen/vultisig/vault/v1/vault_container_pb';
import { Vault, Vault_KeyShare } from '../../gen/vultisig/vault/v1/vault_pb';
import { AddressBookItem } from '../../lib/types/address-book';
import { IVaultService } from './IVaultService';

export class VaultService implements IVaultService {
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

  async saveAddressBookItem(item: Omit<AddressBookItem, 'id'>): Promise<void> {
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

  async createAndSaveBackup(
    vault: Vault | storage.Vault,
    password: string
  ): Promise<void> {
    const base64Data = await this.createBackup(vault, password);
    const wasSaved = await SaveFileBkp(this.getExportName(vault), base64Data);
    if (!wasSaved) {
      throw new Error('Backup was not saved.');
    }
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
    const totalSigners = vault.signers.length;
    const localPartyId =
      vault instanceof Vault ? vault.localPartyId : vault.local_party_id;

    const localPartyIndex = vault.signers.indexOf(localPartyId) + 1;
    return `${vault.name}-${localPartyId}-part${localPartyIndex}of${totalSigners}.vult`;
  }
}
