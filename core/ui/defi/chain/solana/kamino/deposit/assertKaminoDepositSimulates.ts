import {
  PublicKey,
  TransactionError,
  VersionedTransaction,
} from '@solana/web3.js'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { KaminoTokenAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { kaminoConfig } from '@vultisig/core-chain/chains/solana/kamino/config'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import {
  kaminoAllowedProgram,
  kaminoAllowedPrograms,
  kaminoInstructionAccounts,
} from '@vultisig/core-chain/chains/solana/kamino/tx/instructions'
import { kaminoInstructionKind } from '@vultisig/core-chain/chains/solana/kamino/tx/sequence'
import {
  resolveKaminoAccountAddresses,
  resolveKaminoLookupTables,
} from '@vultisig/core-chain/chains/solana/kamino/tx/wire'
import { withSolanaRpcTimeout } from '@vultisig/core-chain/chains/solana/rpcTimeout'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { attempt } from '@vultisig/lib-utils/attempt'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { t } from 'i18next'

/** A deposit the network would refuse, explained in the user's terms. */
export class KaminoDepositRefusedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KaminoDepositRefusedError'
  }
}

type KaminoSimulationFailure = 'insufficientSol' | 'insufficientToken' | 'other'

// A payer with no SOL at all does not exist on chain, hence `AccountNotFound`.
const payerSolErrors = ['AccountNotFound', 'InsufficientFundsForFee']

// The System program's log when a transfer or account creation is short of lamports.
const systemTransferShortfallLog = 'Transfer: insufficient lamports'

// SPL Token's `InsufficientFunds`, code 1.
const tokenInsufficientFundsLog =
  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x1'

const signatureFeeLamports = 5_000n
const microLamportsPerLamport = 1_000_000n
const walletAccountDataSize = 0
const tokenPrograms = new Set<string>([
  kaminoAllowedPrograms.token,
  kaminoAllowedPrograms.token2022,
])
// Every mint these vaults use is classic SPL Token.
const tokenAccountDataSize = 165
// The farms program's `UserState`, created by `initialize_user`.
const farmUserStateDataSize = 920

const isPayerRentShortfall = (err: TransactionError): boolean => {
  if (typeof err !== 'object' || err === null) return false
  if (!('InsufficientFundsForRent' in err)) return false
  const detail = err.InsufficientFundsForRent
  return (
    typeof detail === 'object' &&
    detail !== null &&
    'account_index' in detail &&
    detail.account_index === 0
  )
}

/**
 * Why a simulated Kamino transaction would fail. Read from the runtime's own
 * report: the same `Custom: 1` is SOL when the System program raises it and the
 * token when the Token program does, and only the logs say which.
 */
export const classifyKaminoSimulationFailure = ({
  err,
  logs,
}: {
  err: TransactionError
  logs: readonly string[]
}): KaminoSimulationFailure => {
  if (
    (typeof err === 'string' && payerSolErrors.includes(err)) ||
    isPayerRentShortfall(err) ||
    logs.some(log => log.startsWith(systemTransferShortfallLog))
  ) {
    return 'insufficientSol'
  }
  if (logs.includes(tokenInsufficientFundsLog)) {
    return 'insufficientToken'
  }
  return 'other'
}

type DepositInput = {
  transaction: VersionedTransaction
  vault: KaminoVaultInfo
  owner: string
  amount: KaminoTokenAmount
  ticker: string
  unitLimit: number
  unitPriceMicroLamports: bigint
}

/**
 * The token accounts the transaction's `createIdempotent` instructions open,
 * and whether it initializes a farm user state.
 */
const kaminoAccountsOpened = ({
  transaction,
  accounts,
}: {
  transaction: VersionedTransaction
  accounts: string[]
}): { tokenAccounts: PublicKey[]; initializesFarmUser: boolean } => {
  const tokenAccounts: PublicKey[] = []
  let initializesFarmUser = false
  for (const instruction of transaction.message.compiledInstructions) {
    const kind = kaminoInstructionKind(
      kaminoAllowedProgram(accounts[instruction.programIdIndex]),
      instruction.data
    )
    if (kind === 'createTokenAccount') {
      const index =
        instruction.accountKeyIndexes[
          kaminoInstructionAccounts.associatedToken.account
        ]
      tokenAccounts.push(new PublicKey(accounts[index]))
    } else if (kind === 'farmsInitializeUser') {
      initializesFarmUser = true
    }
  }
  return { tokenAccounts, initializesFarmUser }
}

/**
 * Everything the deposit spends in SOL: fees, rent for the accounts it opens,
 * the wallet's rent-exempt minimum, and the amount itself when wrapped from
 * native SOL. Display only; the simulation is what refuses.
 */
export const kaminoDepositShortfall = async ({
  transaction,
  vault,
  owner,
  amount,
  unitLimit,
  unitPriceMicroLamports,
}: DepositInput): Promise<{ needed: bigint; available: bigint }> => {
  const client = getSolanaClient()
  const lookupTables = await resolveKaminoLookupTables(transaction)
  const accounts = resolveKaminoAccountAddresses({ transaction, lookupTables })
  if (!accounts) {
    throw new Error('Kamino transaction accounts could not be resolved')
  }

  const { tokenAccounts, initializesFarmUser } = kaminoAccountsOpened({
    transaction,
    accounts,
  })

  const [available, walletRent, tokenAccountRent, farmUserRent, opened] =
    await Promise.all([
      client.getBalance(new PublicKey(owner)),
      client.getMinimumBalanceForRentExemption(walletAccountDataSize),
      client.getMinimumBalanceForRentExemption(tokenAccountDataSize),
      initializesFarmUser
        ? client.getMinimumBalanceForRentExemption(farmUserStateDataSize)
        : 0,
      client.getMultipleAccountsInfo(tokenAccounts),
    ])

  // Lamports alone, e.g. sent to the address before it was opened, still need the rent.
  const missingTokenAccounts = opened.filter(
    info => info === null || !tokenPrograms.has(info.owner.toBase58())
  ).length
  const priorityFee =
    (BigInt(unitLimit) * unitPriceMicroLamports +
      microLamportsPerLamport -
      1n) /
    microLamportsPerLamport
  const wrapped =
    vault.descriptor.tokenMint === kaminoConfig.wrappedSolMint
      ? amount.baseUnits
      : 0n

  return {
    needed:
      signatureFeeLamports +
      priorityFee +
      BigInt(missingTokenAccounts) * BigInt(tokenAccountRent) +
      BigInt(farmUserRent) +
      BigInt(walletRent) +
      wrapped,
    available: BigInt(available),
  }
}

const formatSol = (lamports: bigint): string =>
  formatAmount(fromChainAmount(lamports, chainFeeCoin[Chain.Solana].decimals), {
    ticker: chainFeeCoin[Chain.Solana].ticker,
  })

const describeRefusal = async (
  input: DepositInput,
  failure: KaminoSimulationFailure,
  err: TransactionError
): Promise<string> => {
  switch (failure) {
    case 'insufficientToken':
      return t('kamino_earn_insufficient_token', { ticker: input.ticker })
    case 'insufficientSol': {
      const shortfall = await attempt(() =>
        withSolanaRpcTimeout(
          kaminoDepositShortfall(input),
          'Kamino SOL shortfall'
        )
      )
      // Figures that say the wallet can pay would contradict the refusal.
      if (
        'error' in shortfall ||
        shortfall.data.available >= shortfall.data.needed
      ) {
        return t('kamino_earn_insufficient_sol')
      }
      return t('kamino_earn_insufficient_sol_amounts', {
        needed: formatSol(shortfall.data.needed),
        available: formatSol(shortfall.data.available),
      })
    }
    case 'other':
      return t('kamino_earn_simulation_failed', { reason: JSON.stringify(err) })
  }
}

/**
 * Simulates the exact bytes about to be signed and refuses, before the
 * ceremony, a deposit the network would reject.
 */
export const assertKaminoDepositSimulates = async (
  input: DepositInput
): Promise<void> => {
  const { value } = await withSolanaRpcTimeout(
    getSolanaClient().simulateTransaction(input.transaction, {
      sigVerify: false,
      replaceRecentBlockhash: true,
    }),
    'Kamino deposit simulation'
  )
  if (value.err === null) return

  const failure = classifyKaminoSimulationFailure({
    err: value.err,
    logs: value.logs ?? [],
  })
  throw new KaminoDepositRefusedError(
    await describeRefusal(input, failure, value.err)
  )
}
