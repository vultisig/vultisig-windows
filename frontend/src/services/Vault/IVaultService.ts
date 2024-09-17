import { storage } from "../../../wailsjs/go/models";

export interface IVaultService {
    reshare(
        vault: any,
        sessionID: any,
        hexEncryptionKey: any,
        serverURL: any): Promise<storage.Vault | undefined>;

    startKeygen(
        vault: any,
        sessionID: any,
        hexEncryptionKey: any,
        serverURL: any
    ): Promise<storage.Vault | undefined>;

    importVault(buffer: Buffer): Promise<void>;

    encryptVault(passwd: string, vault: Buffer): Buffer;

    decryptVault(passwd: string, vault: Buffer): Buffer;

}
