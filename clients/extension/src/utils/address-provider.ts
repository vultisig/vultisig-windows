import api from '@clients/extension/src/utils/api'
import { errorKey } from '@clients/extension/src/utils/constants'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

interface AddressProps {
  address: string
  derivationKey?: string
}

export default class AddressProvider {
  constructor(private walletCore: WalletCore) {
    this.walletCore = walletCore
  }

  private getECDSAAddress = (
    chain: Chain,
    vault: VaultProps,
    prefix?: string
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      const coin = getCoinType({ walletCore: this.walletCore, chain })

      api
        .derivePublicKey({
          publicKeyEcdsa: vault.publicKeyEcdsa,
          hexChainCode: vault.hexChainCode,
          derivePath: this.walletCore.CoinTypeExt.derivationPath(coin),
        })
        .then(({ data: { publicKey: derivationKey } }) => {
          const bytes = this.walletCore.HexCoding.decode(derivationKey)
          let address: string

          const publicKey = this.walletCore.PublicKey.createWithData(
            bytes,
            this.walletCore.PublicKeyType.secp256k1
          )

          if (prefix) {
            address = this.walletCore.AnyAddress.createBech32WithPublicKey(
              publicKey,
              coin,
              prefix
            )?.description()
          } else {
            address = this.walletCore.AnyAddress.createWithPublicKey(
              publicKey,
              coin
            )?.description()
          }
          if (address)
            resolve({
              address,
              derivationKey,
            })
          else reject(errorKey.FAIL_TO_GET_ADDRESS)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  private getEDDSAAddress = (
    chain: Chain,
    vault: VaultProps
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      const coin = getCoinType({ walletCore: this.walletCore, chain })

      const bytes = this.walletCore.HexCoding.decode(vault.publicKeyEddsa)

      const publicKey = this.walletCore.PublicKey.createWithData(
        bytes,
        this.walletCore.PublicKeyType.ed25519
      )

      const address = this.walletCore.AnyAddress.createWithPublicKey(
        publicKey,
        coin
      )?.description()
      if (address) resolve({ address, derivationKey: publicKey.description() })
      else reject(errorKey.FAIL_TO_GET_ADDRESS)
    })
  }

  public getAddress = (
    chain: Chain,
    vault: VaultProps
  ): Promise<AddressProps> => {
    return new Promise((resolve, reject) => {
      switch (chain) {
        // EDDSA
        case Chain.Polkadot:
        case Chain.Solana:
        case Chain.Sui: {
          this.getEDDSAAddress(chain, vault).then(resolve).catch(reject)

          break
        }
        // ECDSA
        case Chain.MayaChain: {
          this.getECDSAAddress(chain, vault, 'maya').then(resolve).catch(reject)

          break
        }
        case Chain.Osmosis: {
          this.getECDSAAddress(chain, vault, 'osmo').then(resolve).catch(reject)
          break
        }
        case Chain.Dydx: {
          this.getECDSAAddress(chain, vault, 'dydx').then(resolve).catch(reject)
          break
        }
        case Chain.Kujira: {
          this.getECDSAAddress(chain, vault, 'kujira')
            .then(resolve)
            .catch(reject)
          break
        }
        case Chain.BitcoinCash: {
          this.getECDSAAddress(chain, vault)
            .then(({ address, derivationKey }) => {
              resolve({
                address: address.replace('bitcoincash:', ''),
                derivationKey,
              })
            })
            .catch(reject)

          break
        }
        default: {
          this.getECDSAAddress(chain, vault).then(resolve).catch(reject)

          break
        }
      }
    })
  }
}
