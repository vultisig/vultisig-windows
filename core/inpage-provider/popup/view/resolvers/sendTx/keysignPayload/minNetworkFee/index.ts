import { create } from '@bufbuild/protobuf'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { UtxoChain } from '@vultisig/core-chain/Chain'
import { toChainKindRecordUnion } from '@vultisig/core-chain/ChainKind'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { refineKeysignUtxo } from '@vultisig/core-mpc/keysign/refine/utxo'
import { getUtxoSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/utxo'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { UTXOSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { bigIntMax } from '@vultisig/lib-utils/bigint/bigIntMax'
import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { Psbt } from 'bitcoinjs-lib'

import { CustomTxData } from '../../core/customTxData'
import { getPsbtFee, getPsbtMinVsize, getPsbtOutputSizes } from './psbtFee'
import { ceilDiv, getZcashConventionalFee } from './zip317'

type EnforceMinNetworkFeeInput = {
  keysignPayload: KeysignPayload
  customTxData: CustomTxData
  walletCore: WalletCore
  publicKey: PublicKey | null
}

/**
 * Default min-relay floors (base units per vbyte). Anything below is dropped
 * by every default-configured node, so blocking pre-sign saves a guaranteed
 * failed keysign ceremony. Zcash uses ZIP-317 action-based fees instead.
 */
const relayFloorPerVbyte: Record<UtxoChain, bigint> = {
  [UtxoChain.Bitcoin]: 1n,
  [UtxoChain.BitcoinCash]: 1n,
  [UtxoChain.Litecoin]: 1n,
  [UtxoChain.Dogecoin]: 100n,
  [UtxoChain.Dash]: 1n,
  [UtxoChain.Zcash]: 0n,
}

const p2pkhInputSize = 148n
const p2pkhOutputSize = 34n
const zcashTxOverhead = 30n
const maxByteFeeBumps = 3

const memoEncoder = new TextEncoder()

const getOpReturnOutputSize = (memo: string): bigint => {
  const dataSize = memoEncoder.encode(memo).length
  const pushOverhead = dataSize <= 75 ? 2n : 3n

  return 9n + pushOverhead + BigInt(dataSize)
}

type AssertPsbtFeeInput = {
  chain: UtxoChain
  psbt: Psbt
}

const assertPsbtFee = ({ chain, psbt }: AssertPsbtFeeInput): void => {
  const fee = getPsbtFee(psbt)
  if (fee === null) return

  const minFee =
    chain === UtxoChain.Zcash
      ? getZcashConventionalFee({
          inputCount: psbt.txInputs.length,
          outputSizes: getPsbtOutputSizes(psbt),
        })
      : relayFloorPerVbyte[chain] * getPsbtMinVsize(psbt)

  if (fee >= minFee) return

  throw new Error(
    `The dApp built this ${chain} transaction with a network fee of ${fee} base units, below the network minimum of ${minFee}. The network would reject it — ask the dApp to increase the fee.`
  )
}

type GetZcashPlannedOutputSizesInput = {
  change: bigint
  memo: string | undefined
}

const getZcashPlannedOutputSizes = ({
  change,
  memo,
}: GetZcashPlannedOutputSizesInput): bigint[] => {
  const sizes = [p2pkhOutputSize]
  if (change > 0n) sizes.push(p2pkhOutputSize)
  if (memo) sizes.push(getOpReturnOutputSize(memo))

  return sizes
}

type EnforceZcashConventionalFeeInput = EnforceMinNetworkFeeInput & {
  bumpsLeft?: number
}

/**
 * Enforce the ZIP-317 conventional fee on Zcash transactions we plan
 * ourselves. The default 100 sats/byte clears it with room to spare; this
 * floor makes the guarantee structural, covering manual fee-settings
 * overrides and any future byte-fee reduction.
 */
const enforceZcashConventionalFee = async ({
  bumpsLeft = maxByteFeeBumps,
  ...input
}: EnforceZcashConventionalFeeInput): Promise<KeysignPayload> => {
  const { keysignPayload, walletCore, publicKey } = input
  const [signingInput] = await getUtxoSigningInputs({
    keysignPayload,
    walletCore,
    publicKey: shouldBePresent(publicKey, 'publicKey'),
  })
  const plan = shouldBePresent(signingInput.plan, 'UTXO signing input plan')

  const planFee = BigInt(
    shouldBePresent(plan.fee, 'UTXO signing input plan fee').toString()
  )
  const inputCount = plan.utxos?.length ?? 0
  const outputSizes = getZcashPlannedOutputSizes({
    change: BigInt(plan.change?.toString() ?? '0'),
    memo: keysignPayload.memo,
  })
  const conventionalFee = getZcashConventionalFee({ inputCount, outputSizes })
  if (planFee >= conventionalFee) return keysignPayload

  if (bumpsLeft === 0) {
    throw new Error(
      `Failed to meet the Zcash minimum network fee (ZIP-317): planned ${planFee} zats, required ${conventionalFee}`
    )
  }

  const utxoSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'utxoSpecific'
  )
  const estimatedVsize =
    zcashTxOverhead +
    BigInt(inputCount) * p2pkhInputSize +
    bigIntSum(outputSizes)
  const bumpedByteFee = bigIntMax(
    ceilDiv({ value: conventionalFee, divisor: estimatedVsize }),
    BigInt(utxoSpecific.byteFee || '0') + 1n
  )

  const bumpedKeysignPayload: KeysignPayload = {
    ...keysignPayload,
    blockchainSpecific: {
      case: 'utxoSpecific',
      value: create(UTXOSpecificSchema, {
        ...utxoSpecific,
        byteFee: bumpedByteFee.toString(),
      }),
    },
  }

  const refinedPayload = await refineKeysignUtxo({
    keysignPayload: bumpedKeysignPayload,
    walletCore,
    publicKey: shouldBePresent(publicKey, 'publicKey'),
  })

  return enforceZcashConventionalFee({
    ...input,
    keysignPayload: refinedPayload,
    bumpsLeft: bumpsLeft - 1,
  })
}

type EnforceMinUtxoFeeInput = EnforceMinNetworkFeeInput & {
  chain: UtxoChain
}

const enforceMinUtxoFee = async ({
  chain,
  ...input
}: EnforceMinUtxoFeeInput): Promise<KeysignPayload> => {
  if ('psbt' in input.customTxData) {
    assertPsbtFee({ chain, psbt: input.customTxData.psbt })

    return input.keysignPayload
  }

  // Non-Zcash plans already satisfy relay floors: byteFee is network-quoted
  // with a 2.5x buffer and never below 1 base unit per vbyte.
  if (chain !== UtxoChain.Zcash) return input.keysignPayload

  return enforceZcashConventionalFee(input)
}

/**
 * Guard every dApp transaction against fees the network is guaranteed to
 * reject. Where we own the fee we raise it; where the dApp authored the
 * transaction (PSBT) we block pre-sign with an actionable message instead
 * of mutating outputs the user already approved.
 *
 * Chain kinds without a check are safe by construction:
 *  - evm: fee quoted from the network by us; dApp gas values never enter the payload
 *  - cosmos: fee is inside the dApp-signed doc; nodes reject underpaid txs at
 *    CheckTx with an explicit "insufficient fees" before anything moves
 *  - solana: base fee is protocol-fixed and network-deducted; cannot be underpaid
 *  - remaining kinds: fee computed by us from chain config or network quotes
 */
export const enforceMinNetworkFee = (
  input: EnforceMinNetworkFeeInput
): Promise<KeysignPayload> => {
  const chain = getKeysignChain(input.keysignPayload)
  const noOp = async () => input.keysignPayload

  return matchRecordUnion(toChainKindRecordUnion(chain), {
    utxo: utxoChain => enforceMinUtxoFee({ ...input, chain: utxoChain }),
    evm: noOp,
    cosmos: noOp,
    solana: noOp,
    sui: noOp,
    polkadot: noOp,
    bittensor: noOp,
    ton: noOp,
    ripple: noOp,
    tron: noOp,
    cardano: noOp,
    qbtc: noOp,
  })
}
