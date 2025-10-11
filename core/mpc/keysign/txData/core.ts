import { Chain, CosmosChain, IbcEnabledCosmosChain } from '@core/chain/Chain'
import { ChainKind, DeriveChainKind, getChainKind } from '@core/chain/ChainKind'

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

type PolkadotKeysignTxData = PolkadotSpecific

type UtxoKeysignTxData = Omit<UTXOSpecific, 'byteFee'> & {
  utxoInfo: UtxoInfo[]
}

type CardanoKeysignTxData = Omit<CardanoChainSpecific, 'byteFee'>

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

type RippleKeysignTxData = Omit<RippleSpecific, 'gas'>

type SolanaKeysignTxData = Omit<SolanaSpecific, 'priorityFe'>

type EnsureAllKindsCovered<T extends Record<ChainKind, unknown>> = T

type TonKeysignTxData = TonSpecific

type TronKeysignTxData = Omit<TronSpecific, 'gasEstimation'>

type SuiKeysignTxData = Omit<SuiSpecific, 'referenceGasPrice'>

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

type KeysignTxDataRecordUnion<K extends ChainKind = ChainKind> = {
  [Kind in K]: Record<Kind, KeysignTxDataByKind[Kind]>
}[K]

export function toKeysignTxDataRecordUnion<C extends Chain>(
  chain: C,
  quote: KeysignTxDataForChain<C>
): KeysignTxDataRecordUnion<DeriveChainKind<C>> {
  const kind = getChainKind(chain)
  return { [kind]: quote } as unknown as KeysignTxDataRecordUnion<
    DeriveChainKind<C>
  >
}
