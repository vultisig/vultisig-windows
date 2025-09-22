import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getEvmContractCallHexSignature } from '@core/chain/chains/evm/contract/call/hexSignature'
import { getEvmContractCallSignatures } from '@core/chain/chains/evm/contract/call/signatures'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { attempt } from '@lib/utils/attempt'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { WalletCore } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'

import { IKeysignTransactionPayload, ITransactionPayload } from '../interfaces'
import { parseSolanaTx } from './solana/parser'
import { SolanaTxData } from './solana/types/types'

export type RegularTxData = IKeysignTransactionPayload & {
  isEvmContractCall?: boolean
  coin: Coin
}

export type CustomTxData =
  | {
      regular: RegularTxData
    }
  | {
      solanaTx: SolanaTxData
    }
  | {
      psbt: Psbt
    }

type GetCustomTxDataInput = {
  walletCore: WalletCore
  transactionPayload: ITransactionPayload
  getCoin: (coinKey: CoinKey) => Promise<Coin>
}

export const getCustomTxData = ({
  walletCore,
  transactionPayload,
  getCoin,
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
      serialized: async ({ data, chain }) => {
        if (chain === Chain.Bitcoin) {
          const dataBuffer = Buffer.from(data, 'base64')
          const psbt = Psbt.fromBuffer(Buffer.from(dataBuffer))

          return { psbt }
        }

        const serialized = Uint8Array.from(Buffer.from(data, 'base64'))

        return {
          solanaTx: await parseSolanaTx({
            walletCore,
            inputTx: serialized,
            getCoin,
          }),
        }
      },
    }
  )
