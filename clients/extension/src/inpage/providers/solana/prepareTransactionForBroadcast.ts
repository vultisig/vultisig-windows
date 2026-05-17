import {
  AddressLookupTableAccount,
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  PublicKey,
  SystemInstruction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { getDynamicPriorityFeePrice } from '@vultisig/core-chain/chains/solana/getDynamicPriorityFeePrice'
import { solanaConfig } from '@vultisig/core-chain/chains/solana/solanaConfig'

import { isVersionedTransaction } from '../../../utils/functions'

const isSetComputeUnitLimitOrPrice = (
  instruction: TransactionInstruction
): boolean => {
  if (!instruction.programId.equals(ComputeBudgetProgram.programId)) {
    return false
  }
  try {
    const kind = ComputeBudgetInstruction.decodeInstructionType(instruction)
    return kind === 'SetComputeUnitLimit' || kind === 'SetComputeUnitPrice'
  } catch {
    return false
  }
}

const hasNonEmptySignature = (signature: Uint8Array | null): boolean =>
  signature !== null && signature.some(byte => byte !== 0)

const hasAdvanceNonceInstruction = (
  instructions: TransactionInstruction[]
): boolean =>
  instructions.some(ix => {
    if (!ix.programId.equals(SystemProgram.programId)) {
      return false
    }
    try {
      return (
        SystemInstruction.decodeInstructionType(ix) === 'AdvanceNonceAccount'
      )
    } catch {
      return false
    }
  })

const legacyUsesDurableNonce = (transaction: Transaction): boolean =>
  transaction.nonceInfo != null ||
  transaction.minNonceContextSlot != null ||
  hasAdvanceNonceInstruction(transaction.instructions)

const hasExistingSignatures = (
  transaction: Transaction | VersionedTransaction
): boolean => {
  if (isVersionedTransaction(transaction)) {
    return transaction.signatures.some(hasNonEmptySignature)
  }

  return transaction.signatures.some(({ signature }) =>
    hasNonEmptySignature(signature)
  )
}

const stripSetComputeUnitLimitAndPrice = (
  instructions: TransactionInstruction[]
): TransactionInstruction[] =>
  instructions.filter(ix => !isSetComputeUnitLimitOrPrice(ix))

const getExistingComputeBudget = (instructions: TransactionInstruction[]) => {
  let unitLimit = solanaConfig.priorityFeeLimit
  let unitPrice = solanaConfig.priorityFeePrice

  for (const instruction of instructions) {
    if (!instruction.programId.equals(ComputeBudgetProgram.programId)) {
      continue
    }

    try {
      const kind = ComputeBudgetInstruction.decodeInstructionType(instruction)
      if (kind === 'SetComputeUnitLimit') {
        unitLimit = Math.max(
          unitLimit,
          ComputeBudgetInstruction.decodeSetComputeUnitLimit(instruction).units
        )
      }
      if (kind === 'SetComputeUnitPrice') {
        unitPrice = Math.max(
          unitPrice,
          Number(
            ComputeBudgetInstruction.decodeSetComputeUnitPrice(instruction)
              .microLamports
          )
        )
      }
    } catch {
      continue
    }
  }

  return { unitLimit, unitPrice }
}

const collectWritableAccountsForPriorityFee = ({
  feePayer,
  instructions,
}: {
  feePayer: PublicKey
  instructions: TransactionInstruction[]
}): PublicKey[] => {
  const seen = new Set<string>()
  const out: PublicKey[] = []

  const push = (key: PublicKey) => {
    const id = key.toBase58()
    if (seen.has(id)) {
      return
    }
    seen.add(id)
    out.push(key)
  }

  push(feePayer)

  for (const ix of instructions) {
    for (const meta of ix.keys) {
      if (meta.isWritable) {
        push(meta.pubkey)
      }
    }
  }

  return out
}

const getPriorityFeePrice = async (writableAccounts: PublicKey[]) => {
  try {
    return await getDynamicPriorityFeePrice(writableAccounts)
  } catch {
    return solanaConfig.priorityFeePrice
  }
}

const buildComputeBudgetInstructions = ({
  unitLimit,
  unitPrice,
}: {
  unitLimit: number
  unitPrice: number
}) => [
  ComputeBudgetProgram.setComputeUnitLimit({
    units: unitLimit,
  }),
  ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: unitPrice,
  }),
]

const prepareLegacyTransactionForBroadcast = async (
  transaction: Transaction
): Promise<Transaction> => {
  if (legacyUsesDurableNonce(transaction)) {
    return transaction
  }

  const feePayer = transaction.feePayer
  if (!feePayer) {
    return transaction
  }

  const connection = getSolanaClient()
  const existingComputeBudget = getExistingComputeBudget(
    transaction.instructions
  )
  const filtered = stripSetComputeUnitLimitAndPrice(transaction.instructions)
  const writableAccounts = collectWritableAccountsForPriorityFee({
    feePayer,
    instructions: filtered,
  })

  const [dynamicUnitPrice, { blockhash, lastValidBlockHeight }] =
    await Promise.all([
      getPriorityFeePrice(writableAccounts),
      connection.getLatestBlockhash(),
    ])

  const next = new Transaction({
    feePayer,
    recentBlockhash: blockhash,
  })
  next.lastValidBlockHeight = lastValidBlockHeight
  next.add(
    ...buildComputeBudgetInstructions({
      unitLimit: existingComputeBudget.unitLimit,
      unitPrice: Math.max(existingComputeBudget.unitPrice, dynamicUnitPrice),
    }),
    ...filtered
  )

  return next
}

const prepareVersionedTransactionForBroadcast = async (
  transaction: VersionedTransaction
): Promise<VersionedTransaction> => {
  const { message } = transaction
  if (message.version !== 0) {
    return transaction
  }

  const connection = getSolanaClient()
  const addressLookupTableAccounts: AddressLookupTableAccount[] = []

  for (const lookup of message.addressTableLookups) {
    const { value } = await connection.getAddressLookupTable(lookup.accountKey)
    if (!value) {
      return transaction
    }
    addressLookupTableAccounts.push(value)
  }

  let decompiled: TransactionMessage
  try {
    decompiled = TransactionMessage.decompile(message, {
      addressLookupTableAccounts,
    })
  } catch {
    return transaction
  }

  if (hasAdvanceNonceInstruction(decompiled.instructions)) {
    return transaction
  }

  const existingComputeBudget = getExistingComputeBudget(
    decompiled.instructions
  )
  const filtered = stripSetComputeUnitLimitAndPrice(decompiled.instructions)
  const writableAccounts = collectWritableAccountsForPriorityFee({
    feePayer: decompiled.payerKey,
    instructions: filtered,
  })

  const [dynamicUnitPrice, { blockhash }] = await Promise.all([
    getPriorityFeePrice(writableAccounts),
    connection.getLatestBlockhash(),
  ])

  const compiled = new TransactionMessage({
    payerKey: decompiled.payerKey,
    recentBlockhash: blockhash,
    instructions: [
      ...buildComputeBudgetInstructions({
        unitLimit: existingComputeBudget.unitLimit,
        unitPrice: Math.max(existingComputeBudget.unitPrice, dynamicUnitPrice),
      }),
      ...filtered,
    ],
  }).compileToV0Message(addressLookupTableAccounts)

  return new VersionedTransaction(compiled)
}

/**
 * Refreshes blockhash and compute-budget instructions so a legacy or v0
 * transaction is safe to broadcast. Returns `transaction` unchanged when it
 * already has signatures, on error, or after preparation failure.
 *
 * @template T - `Transaction` or `VersionedTransaction`
 */
export const prepareTransactionForBroadcast = async <
  T extends Transaction | VersionedTransaction,
>(
  transaction: T
): Promise<T> => {
  try {
    if (hasExistingSignatures(transaction)) {
      return transaction
    }

    if (isVersionedTransaction(transaction)) {
      return (await prepareVersionedTransactionForBroadcast(transaction)) as T
    }
    return (await prepareLegacyTransactionForBroadcast(transaction)) as T
  } catch {
    return transaction
  }
}
