import { Chain, CosmosChain, IbcEnabledCosmosChain } from '@core/chain/Chain'
import { ChainKind, DeriveChainKind } from '@core/chain/ChainKind'

import {
  CardanoChainSpecific,
  PolkadotSpecific,
  RippleSpecific,
  SolanaSpecific,
  SuiSpecific,
  TonSpecific,
  TransactionType,
  TronSpecific,
  UTXOSpecific,
} from '../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { UtxoInfo } from '../../types/vultisig/keysign/v1/utxo_info_pb'

type EvmKeysignTxData = {
  nonce: bigint
}

type PolkadotKeysignTxData = Omit<PolkadotSpecific, 'gas' | '$typeName'>

type UtxoKeysignTxData = Omit<UTXOSpecific, 'byteFee' | '$typeName'> & {
  utxoInfo: UtxoInfo[]
}

type CardanoKeysignTxData = Omit<
  CardanoChainSpecific,
  'byteFee' | '$typeName'
> & {
  utxoInfo: UtxoInfo[]
}

type IbcDenomTrace = {
  latestBlock: string
  baseDenom: string
  path: string
}

type CosmosKeysignTxData<T extends CosmosChain = CosmosChain> = {
  accountNumber: bigint
  sequence: bigint
  transactionType: TransactionType
} & (T extends IbcEnabledCosmosChain
  ? {
      ibcDenomTraces: IbcDenomTrace
    }
  : {
      isDeposit: boolean
    })

type RippleKeysignTxData = Omit<RippleSpecific, 'gas' | '$typeName'>

export type SolanaKeysignTxData = Omit<
  SolanaSpecific,
  'priorityFee' | '$typeName'
>

type EnsureAllKindsCovered<T extends Record<ChainKind, unknown>> = T

type TonKeysignTxData = Omit<
  TonSpecific,
  '$typeName' | 'sendMaxAmount' | 'jettonAddress' | 'isActiveDestination'
>

type TronKeysignTxData = Omit<TronSpecific, 'gasEstimation' | '$typeName'>

type SuiKeysignTxData = Omit<
  SuiSpecific,
  'referenceGasPrice' | 'gasBudget' | '$typeName'
>

type KeysignTxDataByKind = EnsureAllKindsCovered<{
  evm: EvmKeysignTxData
  utxo: UtxoKeysignTxData
  cosmos: CosmosKeysignTxData
  solana: SolanaKeysignTxData
  ripple: RippleKeysignTxData
  cardano: CardanoKeysignTxData
  polkadot: PolkadotKeysignTxData
  ton: TonKeysignTxData
  tron: TronKeysignTxData
  sui: SuiKeysignTxData
}>

export type KeysignTxData<T extends ChainKind = ChainKind> =
  KeysignTxDataByKind[T]

export type KeysignTxDataForChain<C extends Chain = Chain> =
  KeysignTxDataByKind[DeriveChainKind<C>]
