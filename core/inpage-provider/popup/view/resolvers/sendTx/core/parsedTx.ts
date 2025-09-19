import { Chain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { EvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { NATIVE_MINT } from '@solana/spl-token'
import { Psbt } from 'bitcoinjs-lib'

import { IKeysignTransactionPayload } from '../interfaces'
import { ParsedResult } from './solana/types/types'

export type RegularParsedTx = IKeysignTransactionPayload & {
  evmContractCallInfo?: EvmContractCallInfo
}

export type ParsedTx =
  | {
      tx: RegularParsedTx
    }
  | {
      solanaTx: ParsedResult
    }
  | {
      psbt: Psbt
    }

export const extractCoinKeyFromParsedTx = (parsedTx: ParsedTx) =>
  matchRecordUnion<ParsedTx, CoinKey>(parsedTx, {
    tx: ({ transactionDetails, chain }) => {
      const { ticker, mint } = transactionDetails.asset
      if (mint) {
        return { chain: Chain.Solana, id: mint }
      }

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
    },
    psbt: () => ({
      chain: Chain.Bitcoin,
    }),
    solanaTx: ({ inputMint }) => {
      const chain = Chain.Solana
      if (inputMint === NATIVE_MINT.toBase58()) {
        return { chain }
      }
      return {
        chain,
        id: inputMint,
      }
    },
  })
