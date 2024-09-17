import { WalletCore } from "@trustwallet/wallet-core";
import { storage } from "../../../wailsjs/go/models";
import { SaveVault } from "../../../wailsjs/go/storage/Store";
import { Reshare, StartKeygen } from "../../../wailsjs/go/tss/TssService";
import { DefaultCoinsService } from "../Coin/DefaultCoinsService";
import { IVaultService } from "./IVaultService";
import crypto from 'crypto';
import { Vault } from "../../gen/vultisig/vault/v1/vault_pb";

export class VaultService implements IVaultService {

    private walletCore: WalletCore;
    constructor(walletCore: WalletCore) {
        this.walletCore = walletCore;
    }

    async startKeygen(vault: any, sessionID: any, hexEncryptionKey: any, serverURL: any): Promise<storage.Vault | undefined> {
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

    async reshare(vault: any, sessionID: any, hexEncryptionKey: any, serverURL: any): Promise<storage.Vault | undefined> {
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
            convertValues: () => { },
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
    };

    decryptVault(passwd: string, vault: Buffer): Buffer {
        // Hash the password to create a key
        const key = crypto.createHash('sha256').update(passwd).digest();

        // Create a new AES cipher using the key
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            vault.slice(0, 12)
        );

        // Extract the nonce from the vault
        // const nonce = vault.slice(0, 12);
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
    };
}
