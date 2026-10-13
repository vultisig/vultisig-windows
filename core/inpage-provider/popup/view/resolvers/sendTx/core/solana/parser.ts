import { create } from '@bufbuild/protobuf'
import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { solanaRpcUrl } from '@vultisig/core-chain/chains/solana/client'
import { areEqualCoins, Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getTxBlockaidSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation'
import {
  BlockaidSolanaSimulation,
  parseBlockaidSolanaSimulation,
} from '@vultisig/core-chain/security/blockaid/tx/simulation/api/core'
import { BlockaidSolanaSimulationInfo } from '@vultisig/core-chain/security/blockaid/tx/simulation/core'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { getBlockaidTxSimulationInput } from '@vultisig/core-mpc/security/blockaid/tx/simulation/input'
import {
  OneInchQuoteSchema,
  OneInchSwapPayloadSchema,
  OneInchTransactionSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { Coin as CommCoin } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

import { parseProgramCall } from './parseProgramCall'
import {
  getSerializedSolanaTxBuffer,
  getSolanaMultiTxRawFallback,
  getSolanaRawTxFallback,
} from './rawTxFallback'
import { AddressTableLookup, SolanaTxData } from './types/types'
import { mergedKeys, resolveAddressTableKeys } from './utils'

type ParseSolanaTxInput = {
  fromCoin: CommCoin
  walletCore: WalletCore
  data: string[]
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  swapProvider: string
}

const toAddressTableLookups = (
  lookups:
    | TW.Solana.Proto.RawMessage.IMessageAddressTableLookup[]
    | null
    | undefined
): AddressTableLookup[] =>
  (lookups ?? []).map(({ accountKey, writableIndexes, readonlyIndexes }) => ({
    accountKey: shouldBePresent(accountKey, 'addressTableLookup.accountKey'),
    writableIndexes: writableIndexes ?? [],
    readonlyIndexes: readonlyIndexes ?? [],
  }))

const hasAssetMovements = ({ account_summary }: BlockaidSolanaSimulation) =>
  'account_assets_diff' in account_summary &&
  account_summary.account_assets_diff.length > 0

type GetConfirmedReceiverAddressInput = {
  decodeInstructions: () => Promise<SolanaTxData>
  inputCoin: Coin
  inAmount: string
}

/**
 * Blockaid's summary proves what leaves the account but not where it goes.
 * The destination comes from the decoded transfer instruction, and only when
 * that instruction moves exactly the coin and amount the simulation reported;
 * any disagreement leaves the destination unknown rather than naming an
 * account the simulated movement may not reach.
 */
const getConfirmedReceiverAddress = async ({
  decodeInstructions,
  inputCoin,
  inAmount,
}: GetConfirmedReceiverAddressInput) => {
  const { data: decoded } = await attempt(decodeInstructions)
  if (!decoded || !('transfer' in decoded)) {
    return ''
  }

  const { transfer } = decoded
  const isSameMovement =
    areEqualCoins(transfer.inputCoin, inputCoin) &&
    transfer.inAmount === inAmount

  return isSameMovement ? transfer.receiverAddress : ''
}

/**
 * Builds the approval view for a dApp-supplied Solana transaction. Blockaid's
 * simulation decides what the transaction moves; the decoded instructions
 * supply the destination it cannot see, and carry the whole review when the
 * simulation is unreachable or reports no net movement for the sender.
 */
export const parseSolanaTx = async ({
  fromCoin,
  walletCore,
  data,
  getCoin,
  swapProvider,
}: ParseSolanaTxInput): Promise<SolanaTxData> => {
  const multiTxRawFallback = getSolanaMultiTxRawFallback(data)
  if (multiTxRawFallback) {
    return multiTxRawFallback
  }

  const buffer = getSerializedSolanaTxBuffer(data)
  const encodedTx = walletCore.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )
  if (!encodedTx) throw new Error('Could not encode transaction')
  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx)
  if (!decodedTx.transaction)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const tx = decodedTx.transaction?.v0 ?? decodedTx.transaction?.legacy
  if (!tx)
    throw new Error('Invalid Solana transaction: missing v0 transaction data')

  const addressTableLookups = decodedTx.transaction.v0?.addressTableLookups

  const decodeInstructions = async (): Promise<SolanaTxData> => {
    const resolvedKeys = await attempt(async () =>
      resolveAddressTableKeys({
        lookups: toAddressTableLookups(addressTableLookups),
        connection: new Connection(solanaRpcUrl),
      })
    )

    if ('error' in resolvedKeys) {
      console.warn(
        'could not resolve Solana address lookup tables, returning raw fallback',
        resolvedKeys.error
      )
      return getSolanaRawTxFallback(data)
    }

    const staticKeys = (tx.accountKeys ?? []).map(k => new PublicKey(k))
    const keys = mergedKeys(staticKeys, resolvedKeys.data)

    const { data: parsedTx } = await attempt(
      parseProgramCall({
        tx,
        keys,
        senderAddress: fromCoin.address,
        getCoin,
        swapProvider,
        data: data[0],
      })
    )

    if (parsedTx && 'raw' in parsedTx) {
      return {
        raw: parsedTx.raw,
      }
    }

    if (parsedTx && 'transfer' in parsedTx) {
      return {
        transfer: {
          ...parsedTx.transfer,
          rawTransactions: data,
        },
      }
    }

    if (parsedTx && 'swap' in parsedTx) {
      return {
        swap: {
          ...parsedTx.swap,
          rawTransactions: data,
        },
      }
    }

    return getSolanaRawTxFallback(data)
  }

  const { data: simulation } = await attempt(async () => {
    const keysignPayload = create(KeysignPayloadSchema, {
      coin: fromCoin,

      swapPayload: {
        case: 'oneinchSwapPayload',
        value: create(OneInchSwapPayloadSchema, {
          fromCoin,
          toCoin: fromCoin,
          fromAmount: '0',
          toAmountDecimal: '0',
          quote: create(OneInchQuoteSchema, {
            dstAmount: '0',
            tx: create(OneInchTransactionSchema, {
              data: Buffer.from(buffer).toString('base64'),
              value: '0',
              gasPrice: '0',
              gas: BigInt(0),
            }),
          }),
          provider: '1inch',
        }),
      },
    })

    keysignPayload.blockchainSpecific = await getChainSpecific({
      keysignPayload,
      walletCore,
    })

    const blockaidTxSimulationInput = await getBlockaidTxSimulationInput({
      payload: keysignPayload,
      walletCore,
    })

    if (!blockaidTxSimulationInput) {
      throw new Error('Error getting blockaid tx simulation input')
    }

    return getTxBlockaidSimulation({
      chain: Chain.Solana,
      data: blockaidTxSimulationInput.data,
    })
  })

  // Without a simulation, or with one that saw no net movement for the sender
  // (a transfer back to the sender's own address), there is nothing a partial
  // instruction summary could hide, so the instructions carry the review.
  if (!simulation || !hasAssetMovements(simulation)) {
    return decodeInstructions()
  }

  const { data: simulationResult } = await attempt(() =>
    parseBlockaidSolanaSimulation(simulation)
  )
  // A completed simulation with no safe summary must not be replaced by a
  // partial instruction summary that can hide other asset movements.
  if (!simulationResult) {
    return getSolanaRawTxFallback(data)
  }

  return matchRecordUnion<BlockaidSolanaSimulationInfo, Promise<SolanaTxData>>(
    simulationResult,
    {
      swap: async ({ fromMint, toMint, fromAmount, toAmount }) => {
        const [inputCoin, outputCoin] = await Promise.all(
          [fromMint, toMint].map(mint => {
            const id = mint === NATIVE_MINT.toBase58() ? undefined : mint
            return getCoin({ chain: Chain.Solana, id })
          })
        )
        return {
          swap: {
            authority: fromCoin.address,
            inAmount: fromAmount.toString(),
            inputCoin,
            outAmount: toAmount.toString(),
            outputCoin,
            data: data[0],
            swapProvider,
            rawTransactions: data,
          },
        }
      },
      transfer: async ({ fromAmount, fromMint }) => {
        const id = fromMint === NATIVE_MINT.toBase58() ? undefined : fromMint
        const inputCoin = await getCoin({ chain: Chain.Solana, id })
        const inAmount = fromAmount.toString()

        return {
          transfer: {
            authority: fromCoin.address,
            inputCoin,
            inAmount,
            receiverAddress: await getConfirmedReceiverAddress({
              decodeInstructions,
              inputCoin,
              inAmount,
            }),
            rawTransactions: data,
          },
        }
      },
    }
  )
}
