import { storage } from '../../../wailsjs/go/models';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import {
  AddAddressBookItem,
  AddressBookItem,
} from '../../lib/types/address-book';

export interface IVaultService {
  reshare(
    vault: any,
    sessionID: any,
    hexEncryptionKey: any,
    serverURL: any
  ): Promise<storage.Vault>;

  startKeygen(
    vault: any,
    sessionID: any,
    hexEncryptionKey: any,
    serverURL: any
  ): Promise<storage.Vault>;

  importVault(buffer: Buffer): Promise<void>;

  encryptVault(passwd: string, vault: Buffer): Buffer;

  decryptVault(passwd: string, vault: Buffer): Buffer;

  createBackup(vault: Vault | storage.Vault, password: string): Promise<string>;

  createAndSaveBackup(
    vault: Vault | storage.Vault,
    password: string
  ): Promise<void>;

  storageToProtoVault(storageVault: storage.Vault): Vault;

  renameVault(vault: Vault | storage.Vault, newName: string): Promise<void>;

  deleteAddressBookItem(id: string): Promise<void>;

  updateAddressBookItem(item: AddressBookItem): Promise<void>;

  saveAddressBookItem(item: AddAddressBookItem): Promise<void>;

  getAllAddressBookItems(): Promise<storage.AddressBookItem[]>;

  getVaultSettings(): Promise<storage.Settings[]>;

  updateVaultSettings(settings: storage.Settings): Promise<void>;
}
