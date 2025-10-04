import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getEvmContractCallHexSignature } from '@core/chain/chains/evm/contract/call/hexSignature'
import { getEvmContractCallSignatures } from '@core/chain/chains/evm/contract/call/signatures'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { Vault } from '@core/ui/vault/Vault'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { WalletCore } from '@trustwallet/wallet-core'
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
          if (!isChainOfKind(tx.chain, 'evm')) {
            return false
          }

          const { data } = tx.transactionDetails
          if (!data || data === '0x') {
            return false
          }

          const { data: potentialData } = await attempt(
            getEvmContractCallSignatures(getEvmContractCallHexSignature(data))
          )

          return potentialData && potentialData.count > 0
        }

        const getCoinKey = (): CoinKey => {
          const { ticker, mint } = tx.transactionDetails.asset
          if (mint) {
            return { chain: Chain.Solana, id: mint }
          }

          const { chain } = tx

          const feeCoin = chainFeeCoin[chain]

          if (areLowerCaseEqual(ticker, feeCoin.ticker)) {
            return { chain }
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
        if (chain === Chain.Bitcoin) {
          const dataBuffer = Buffer.from(data, 'base64')
          let psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))
          if (params && params.length > 0) {
            const publicKey = getPublicKey({
              chain: Chain.Bitcoin,
              walletCore,
              hexChainCode: vault.hexChainCode,
              publicKeys: vault.publicKeys,
            })
            const address = deriveAddress({
              chain,
              publicKey,
              walletCore,
            })
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
            walletCore,
            data,
            getCoin,
            swapProvider: getUrlBaseDomain(requestOrigin),
          }),
        }
      },
    }
  )
