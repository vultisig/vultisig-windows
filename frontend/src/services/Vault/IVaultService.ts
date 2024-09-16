import { storage } from "../../../wailsjs/go/models";

export interface IVaultService {
    Reshare(
        vault: any,
        sessionID: any,
        hexEncryptionKey: any,
        serverURL: any): Promise<storage.Vault | undefined>;

    StartKeygen(
        vault: any,
        sessionID: any,
        hexEncryptionKey: any,
        serverURL: any
    ): Promise<storage.Vault | undefined>;

}
