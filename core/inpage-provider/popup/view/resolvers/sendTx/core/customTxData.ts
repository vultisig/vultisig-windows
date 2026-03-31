import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { getEvmContractCallHexSignature } from '@vultisig/core-chain/chains/evm/contract/call/hexSignature'
import { getEvmContractCallSignatures } from '@vultisig/core-chain/chains/evm/contract/call/signatures'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { deriveAddress } from '@vultisig/core-chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'
import { Psbt } from 'bitcoinjs-lib'

import { IKeysignTransactionPayload, ITransactionPayload } from '../interfaces'
import { parseSolanaTx } from './solana/parser'
import { SolanaTxData } from './solana/types/types'
import { restrictPsbtToInputs } from './utxo/restrictPsbt'

type RegularTxData = IKeysignTransactionPayload & {
  isEvmContractCall?: boolean
  coin: Coin
}

export type CustomTxData =
  | {
      regular: RegularTxData
    }
  | {
      solana: SolanaTxData
    }
  | {
      psbt: Psbt
    }

type GetCustomTxDataInput = {
  walletCore: WalletCore
  vault: Vault
  transactionPayload: ITransactionPayload
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  requestOrigin: string
}

export const getCustomTxData = ({
  walletCore,
  vault,
  transactionPayload,
  getCoin,
  requestOrigin,
}: GetCustomTxDataInput) =>
  matchRecordUnion<ITransactionPayload, Promise<CustomTxData>>(
    transactionPayload,
    {
      keysign: async tx => {
        const getIsEvmContractCall = async () => {
          if (!isChainOfKind(tx.chain, 'evm')) return false

          const { data } = tx.transactionDetails

          if (!data || data === '0x') return false

          const result = await attempt(
            getEvmContractCallSignatures(getEvmContractCallHexSignature(data))
          )

          if ('error' in result) return false

          const { data: potentialData } = result

          return potentialData && potentialData.count > 0
        }

        const getCoinKey = (): CoinKey => {
          const { ticker, mint, contractAddress } = tx.transactionDetails.asset
          if (mint) {
            return { chain: Chain.Solana, id: mint }
          }

          const { chain } = tx

          const feeCoin = chainFeeCoin[chain]

          if (areLowerCaseEqual(ticker, feeCoin.ticker)) {
            return { chain }
          }

          if (contractAddress) {
            return { chain, id: contractAddress }
          }

          if (
            isChainOfKind(chain, 'cosmos') &&
            areLowerCaseEqual(ticker, cosmosFeeCoinDenom[chain])
          ) {
            return { chain }
          }

          return { chain, id: ticker }
        }

        const coin = await getCoin(getCoinKey())

        return {
          regular: {
            ...tx,
            isEvmContractCall: await getIsEvmContractCall(),
            coin,
          },
        }
      },
      serialized: async ({ data, chain, params }) => {
        const publicKey = getPublicKey({
          chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
          chainPublicKeys: vault.chainPublicKeys,
        })
        const address = deriveAddress({
          chain,
          publicKey,
          walletCore,
        })

        if (chain === Chain.Bitcoin) {
          const dataBuffer = Buffer.from(data[0], 'base64')
          let psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))
          if (params && params.length > 0) {
            const currentWalletEntries = params.filter(e =>
              areLowerCaseEqual(e.address, address)
            )
            if (currentWalletEntries.length === 0) {
              throw new Error('No entries for wallet address')
            }
            psbt = restrictPsbtToInputs(
              psbt,
              currentWalletEntries.map(p => ({
                signingIndexes: p.signingIndexes,
                sigHash: p.sigHash,
              })),
              Buffer.from(publicKey.data())
            )
          }
          return { psbt }
        }

        return {
          solana: await parseSolanaTx({
            fromCoin: toCommCoin({
              ...(await getCoin({ chain: Chain.Solana })),
              hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
              address,
            }),
            walletCore,
            data: data,
            getCoin,
            swapProvider: getUrlBaseDomain(requestOrigin),
          }),
        }
      },
    }
  )
