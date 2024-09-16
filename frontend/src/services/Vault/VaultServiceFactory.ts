import { WalletCore } from "@trustwallet/wallet-core";
import { IVaultService } from "./IVaultService";
import { VaultService } from "./VaultService";

export class VaultServiceFactory {
    static getService(walletCore: WalletCore): IVaultService {
        return new VaultService(walletCore);
    }
}