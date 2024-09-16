import { WalletCore } from "@trustwallet/wallet-core";
import { storage } from "../../../wailsjs/go/models";
import { SaveVault } from "../../../wailsjs/go/storage/Store";
import { Reshare, StartKeygen } from "../../../wailsjs/go/tss/TssService";
import { DefaultCoinsService } from "../Coin/DefaultCoinsService";
import { IVaultService } from "./IVaultService";

export class VaultService implements IVaultService {

    private walletCore: WalletCore;
    constructor(walletCore: WalletCore) {
        this.walletCore = walletCore;
    }

    async StartKeygen(vault: any, sessionID: any, hexEncryptionKey: any, serverURL: any): Promise<storage.Vault | undefined> {
        const newVault = await StartKeygen(
            vault.name,
            vault.local_party_id,
            sessionID,
            vault.hex_chain_code,
            hexEncryptionKey,
            serverURL
        ).catch(err => {
            console.log(err);
        });

        if (newVault !== undefined) {
            await SaveVault(newVault);
            new DefaultCoinsService(this.walletCore).applyDefaultCoins(newVault);
            return newVault;
        }
    }

    async Reshare(vault: any, sessionID: any, hexEncryptionKey: any, serverURL: any): Promise<storage.Vault | undefined> {
        const newVault = await Reshare(
            vault,
            sessionID,
            hexEncryptionKey,
            serverURL
        ).catch(err => {
            console.log(err);
        });

        if (newVault !== undefined) {
            await SaveVault(newVault);
            new DefaultCoinsService(this.walletCore).applyDefaultCoins(newVault);
            return newVault;
        }
    }
}