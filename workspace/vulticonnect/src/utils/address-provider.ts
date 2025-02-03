import { WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { ChainKey, errorKey } from "utils/constants";
import { VaultProps } from "utils/interfaces";
import api from "utils/api";

interface AddressProps {
  address: string;
  derivationKey?: string;
}

export default class AddressProvider {
  constructor(
    private chainRef: { [chainKey: string]: CoinType },
    private walletCore: WalletCore
  ) {
    this.chainRef = chainRef;
    this.walletCore = walletCore;
  }

  private getECDSAAddress = (
    chain: ChainKey,
    vault: VaultProps,
    prefix?: string
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      const coin = this.chainRef[chain];

      api
        .derivePublicKey({
          publicKeyEcdsa: vault.publicKeyEcdsa,
          hexChainCode: vault.hexChainCode,
          derivePath: this.walletCore.CoinTypeExt.derivationPath(coin),
        })
        .then(({ data: { publicKey: derivationKey } }) => {
          const bytes = this.walletCore.HexCoding.decode(derivationKey);
          let address: string;

          const publicKey = this.walletCore.PublicKey.createWithData(
            bytes,
            this.walletCore.PublicKeyType.secp256k1
          );

          if (prefix) {
            address = this.walletCore.AnyAddress.createBech32WithPublicKey(
              publicKey,
              coin,
              prefix
            )?.description();
          } else {
            address = this.walletCore.AnyAddress.createWithPublicKey(
              publicKey,
              coin
            )?.description();
          }


          address
            ? resolve({
                address,
                derivationKey,
              })
            : reject(errorKey.FAIL_TO_GET_ADDRESS);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  private getEDDSAAddress = (
    chain: ChainKey,
    vault: VaultProps
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      const coin = this.chainRef[chain];

      const bytes = this.walletCore.HexCoding.decode(vault.publicKeyEddsa);

      const publicKey = this.walletCore.PublicKey.createWithData(
        bytes,
        this.walletCore.PublicKeyType.ed25519
      );

      const address = this.walletCore.AnyAddress.createWithPublicKey(
        publicKey,
        coin
      )?.description();

      address
        ? resolve({ address, derivationKey: publicKey.description() })
        : reject(errorKey.FAIL_TO_GET_ADDRESS);
    });
  };

  public getAddress = (
    chain: ChainKey,
    vault: VaultProps
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      switch (chain) {
        // EDDSA
        case ChainKey.POLKADOT:
        case ChainKey.SOLANA:
        case ChainKey.SUI: {
          this.getEDDSAAddress(chain, vault).then(resolve).catch(reject);

          break;
        }
        // ECDSA
        case ChainKey.MAYACHAIN: {
          this.getECDSAAddress(chain, vault, "maya")
            .then(resolve)
            .catch(reject);

          break;
        }
        case ChainKey.OSMOSIS: {
          this.getECDSAAddress(chain, vault, "osmo")
            .then(resolve)
            .catch(reject);
          break;
        }
        case ChainKey.DYDX: {
          this.getECDSAAddress(chain, vault, "dydx")
            .then(resolve)
            .catch(reject);
          break;
        }
        case ChainKey.KUJIRA: {
          this.getECDSAAddress(chain, vault, "kujira")
            .then(resolve)
            .catch(reject);
          break;
        }
        case ChainKey.BITCOINCASH: {
          this.getECDSAAddress(chain, vault)
            .then(({ address, derivationKey }) => {
              resolve({
                address: address.replace("bitcoincash:", ""),
                derivationKey,
              });
            })
            .catch(reject);

          break;
        }
        default: {
          this.getECDSAAddress(chain, vault).then(resolve).catch(reject);

          break;
        }
      }
    });
  };
}
