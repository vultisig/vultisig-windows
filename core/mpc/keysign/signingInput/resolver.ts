import { ChainKind, ChainOfKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { TW } from '@trustwallet/wallet-core'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

export type GetSigningInputInput<T extends ChainKind> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  chain: ChainOfKind<T>
} & (T extends 'utxo' ? { publicKey: PublicKey } : {})

export const signingInputTypes = {
  cardano: TW.Cardano.Proto.SigningInput,
  cosmos: TW.Cosmos.Proto.SigningInput,
  evm: TW.Ethereum.Proto.SigningInput,
  polkadot: TW.Polkadot.Proto.SigningInput,
  ripple: TW.Ripple.Proto.SigningInput,
  solana: TW.Solana.Proto.SigningInput,
  sui: TW.Sui.Proto.SigningInput,
  ton: TW.TheOpenNetwork.Proto.SigningInput,
  tron: TW.Tron.Proto.SigningInput,
  utxo: TW.Bitcoin.Proto.SigningInput,
} as const satisfies Record<ChainKind, unknown>

export type SigningInputType<T extends ChainKind> = InstanceType<
  (typeof signingInputTypes)[T]
>

export type SigningInputResolver<T extends ChainKind> = Resolver<
  GetSigningInputInput<T>,
  SigningInputType<T>
>
