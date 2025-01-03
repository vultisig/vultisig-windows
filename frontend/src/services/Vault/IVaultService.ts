import { storage } from '../../../wailsjs/go/models';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { AddressBookItem } from '../../lib/types/address-book';

export interface IVaultService {
  encryptVault(passwd: string, vault: Buffer): Buffer;

  createBackup(vault: Vault | storage.Vault, password: string): Promise<string>;

  createAndSaveBackup(
    vault: Vault | storage.Vault,
    password: string
  ): Promise<void>;

  storageToProtoVault(storageVault: storage.Vault): Vault;

  renameVault(vault: Vault | storage.Vault, newName: string): Promise<void>;

  deleteAddressBookItem(id: string): Promise<void>;

  updateAddressBookItem(item: AddressBookItem): Promise<void>;

  saveAddressBookItem(item: Omit<AddressBookItem, 'id'>): Promise<void>;

  getAllAddressBookItems(): Promise<storage.AddressBookItem[]>;

  getVaultSettings(): Promise<storage.Settings[]>;

  updateVaultSettings(settings: storage.Settings): Promise<void>;
}
