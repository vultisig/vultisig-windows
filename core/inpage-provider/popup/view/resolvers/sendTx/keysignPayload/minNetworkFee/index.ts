import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { UtxoChain } from '@vultisig/core-chain/Chain'
import { toChainKindRecordUnion } from '@vultisig/core-chain/ChainKind'
import { getZcashConventionalFee } from '@vultisig/core-chain/chains/utxo/fee/zip317'
import { getUtxoSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/utxo'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { Psbt } from 'bitcoinjs-lib'

import { CustomTxData } from '../../core/customTxData'
import { getPsbtFee, getPsbtMinVsize, getPsbtOutputSizes } from './psbtFee'

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

const p2pkhOutputSize = 34n

const memoEncoder = new TextEncoder()

const getOpReturnOutputSize = (memo: string): bigint => {
  const dataSize = BigInt(memoEncoder.encode(memo).length)

  // OP_RETURN (1 byte) + push opcode bytes for `dataSize`.
  const pushOverhead =
    dataSize <= 75n
      ? 2n
      : dataSize <= 0xffn
        ? 3n
        : dataSize <= 0xffffn
          ? 4n
          : 6n
  const scriptSize = pushOverhead + dataSize

  // CompactSize encoding of the script length prefix.
  const scriptLengthSize =
    scriptSize < 0xfdn
      ? 1n
      : scriptSize <= 0xffffn
        ? 3n
        : scriptSize <= 0xffffffffn
          ? 5n
          : 9n

  return 8n + scriptLengthSize + scriptSize
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

/**
 * Pre-sign safety check that the Zcash plan meets the ZIP-317 conventional
 * fee. The SDK signing-input resolver now raises memo-send fees to clear this
 * floor at plan time — WalletCore's zip_0317 planner sizes an OP_RETURN output
 * as a flat ~34 bytes and ignores byteFee, so it plans memo sends one logical
 * action short with no way to raise the fee in that mode. This guard blocks
 * pre-sign if a plan still underpays, rather than starting a keysign ceremony
 * the network is guaranteed to reject.
 */
const enforceZcashConventionalFee = async (
  input: EnforceMinNetworkFeeInput
): Promise<KeysignPayload> => {
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

  throw new Error(
    `Failed to meet the Zcash minimum network fee (ZIP-317): planned ${planFee} zats, required ${conventionalFee}`
  )
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
