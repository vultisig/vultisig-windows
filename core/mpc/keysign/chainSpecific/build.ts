import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import {
  ChainKind,
  ChainOfKind,
  DeriveChainKind,
  getChainKind,
} from '@core/chain/ChainKind'
import { FeeQuote, FeeQuoteForChain } from '@core/chain/feeQuote/core'
import {
  CardanoChainSpecificSchema,
  CosmosSpecificSchema,
  EthereumSpecificSchema,
  MAYAChainSpecificSchema,
  PolkadotSpecificSchema,
  RippleSpecificSchema,
  SolanaSpecificSchema,
  SuiSpecificSchema,
  THORChainSpecificSchema,
  TonSpecificSchema,
  TronSpecificSchema,
  UTXOSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { KeysignTxData, KeysignTxDataForChain } from '../txData/core'
import {
  chainSpecificRecord,
  KeysignChainSpecific,
} from './KeysignChainSpecific'

export type BuildChainSpecificInput = {
  chain: Chain
  txData: KeysignTxDataForChain<Chain>
  feeQuote: FeeQuoteForChain<Chain>
}

type ChainSpecificRecordUnion<K extends ChainKind = ChainKind> = {
  [Kind in K]: Record<
    Kind,
    {
      chain: ChainOfKind<Kind>
      feeQuote: FeeQuote<Kind>
      txData: KeysignTxData<Kind>
    }
  >
}[K]

type BuildChainSpecificRecordUnionInput<C extends Chain> = {
  chain: C
  txData: KeysignTxDataForChain<C>
  feeQuote: FeeQuoteForChain<C>
}

const toBuildKindRecordUnion = <C extends Chain>(
  input: BuildChainSpecificRecordUnionInput<C>
): ChainSpecificRecordUnion<DeriveChainKind<C>> => {
  const kind = getChainKind(input.chain)
  return {
    [kind]: input,
  } as unknown as ChainSpecificRecordUnion<DeriveChainKind<C>>
}

export const buildChainSpecific = ({
  chain,
  txData,
  feeQuote,
}: BuildChainSpecificInput): KeysignChainSpecific => {
  const specificCase = chainSpecificRecord[chain]

  return matchRecordUnion(toBuildKindRecordUnion({ chain, feeQuote, txData }), {
    evm: ({ feeQuote, txData }) => {
      const maxFeePerGasWei = (
        feeQuote.baseFeePerGas + feeQuote.maxPriorityFeePerGas
      ).toString()

      const value = create(EthereumSpecificSchema, {
        maxFeePerGasWei,
        priorityFee: feeQuote.maxPriorityFeePerGas.toString(),
        nonce: txData.nonce,
        gasLimit: feeQuote.gasLimit.toString(),
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },

    utxo: ({ feeQuote, txData }) => {
      const value = create(UTXOSpecificSchema, {
        byteFee: feeQuote.byteFee.toString(),
        sendMaxAmount: Boolean(txData.sendMaxAmount),
        psbt: txData.psbt,
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },

    cosmos: ({ chain, feeQuote, txData }) => {
      if (chain === Chain.THORChain) {
        const value = create(THORChainSpecificSchema, {
          accountNumber: txData.accountNumber,
          sequence: txData.sequence,
          fee: feeQuote.gas,
          isDeposit: Boolean((txData as any).isDeposit),
          transactionType: txData.transactionType,
        })

        return { case: specificCase, value } as KeysignChainSpecific
      }

      if (chain === Chain.MayaChain) {
        const value = create(MAYAChainSpecificSchema, {
          accountNumber: txData.accountNumber,
          sequence: txData.sequence,
          isDeposit: Boolean((txData as any).isDeposit),
        })

        return { case: specificCase, value } as KeysignChainSpecific
      }

      const value = create(CosmosSpecificSchema, {
        accountNumber: txData.accountNumber,
        sequence: txData.sequence,
        gas: feeQuote.gas,
        transactionType: txData.transactionType,
        ibcDenomTraces: (txData as any).ibcDenomTraces,
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },

    solana: ({ feeQuote, txData }) => {
      const value = create(SolanaSpecificSchema, {
        recentBlockHash: (txData as any).recentBlockHash,
        priorityFee: feeQuote.priorityFee.toString(),
        fromTokenAssociatedAddress: (txData as any).fromTokenAssociatedAddress,
        toTokenAssociatedAddress: (txData as any).toTokenAssociatedAddress,
        programId: (txData as any).programId,
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },

    ripple: ({ feeQuote, txData }) => {
      const value = create(RippleSpecificSchema, {
        sequence: (txData as any).sequence,
        gas: feeQuote.gas,
        lastLedgerSequence: (txData as any).lastLedgerSequence,
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },

    cardano: ({ feeQuote, txData }) => {
      const value = create(CardanoChainSpecificSchema, {
        byteFee: feeQuote.byteFee,
        sendMaxAmount: Boolean((txData as any).sendMaxAmount),
        ttl: (txData as any).ttl,
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },

    polkadot: ({ txData }) => {
      const value = create(PolkadotSpecificSchema, txData as any)
      return { case: specificCase, value } as KeysignChainSpecific
    },

    ton: ({ txData }) => {
      const value = create(TonSpecificSchema, txData as any)
      return { case: specificCase, value } as KeysignChainSpecific
    },

    tron: ({ feeQuote, txData }) => {
      const value = create(TronSpecificSchema, {
        ...(txData as any),
        gasEstimation: feeQuote.gas,
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },

    sui: ({ feeQuote, txData }) => {
      const value = create(SuiSpecificSchema, {
        referenceGasPrice: feeQuote.gas.toString(),
        coins: (txData as any).coins ?? [],
      })

      return { case: specificCase, value } as KeysignChainSpecific
    },
  })
}
