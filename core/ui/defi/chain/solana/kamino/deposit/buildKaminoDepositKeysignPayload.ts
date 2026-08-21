import { create } from '@bufbuild/protobuf'
import { getDynamicPriorityFeePrice } from '@vultisig/core-chain/chains/solana/getDynamicPriorityFeePrice'
import { KaminoTokenAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { buildKaminoDepositTransaction } from '@vultisig/core-chain/chains/solana/kamino/tx/actions'
import {
  clampKaminoUnitPrice,
  kaminoComputeBudget,
  kaminoExpectedUnitLimit,
} from '@vultisig/core-chain/chains/solana/kamino/tx/computeBudget'
import { validateKaminoTransactionOnline } from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
import {
  injectKaminoAttributionMemo,
  injectKaminoComputeBudget,
  parseKaminoWireTransaction,
  refreshKaminoRecentBlockhash,
  serializeKaminoWireTransaction,
} from '@vultisig/core-chain/chains/solana/kamino/tx/wire'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { KeysignLibType } from '@vultisig/core-mpc/mpcLib'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignSolanaSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { attempt } from '@vultisig/lib-utils/attempt'

type BuildKaminoDepositKeysignPayloadInput = {
  /** The hydrated vault being deposited into. */
  vault: KaminoVaultInfo
  /** The vault's underlying coin, carrying the depositor's Solana address. */
  coin: AccountCoin
  /** The deposit, in the underlying token's base units. */
  amount: KaminoTokenAmount
  hexPublicKey: string
  vaultId: string
  localPartyId: string
  libType: KeysignLibType
}

/**
 * Builds the keysign payload for one Kamino Earn deposit.
 *
 * Run in full immediately before the ceremony rather than when the review
 * screen mounts: Kamino's builder embeds a blockhash worth ~60–90 seconds and
 * an MPC round can outlive it, and every gate below is a check on what is
 * about to be signed rather than on what was fetched earlier.
 *
 * The order is load-bearing. Kamino emits no ComputeBudget instruction and no
 * memo, so both are injected here — the budget in front, the attribution memo
 * behind every instruction that moves money — then the blockhash is replaced,
 * and only then is the whole thing validated. Validating before injection
 * would check a transaction that is not the one being signed.
 *
 * Nothing here mutates the transaction by hand: the injections, the blockhash
 * replacement and the validator all live in the chain package, and the bytes
 * this returns are the bytes every co-signing device signs.
 */
export const buildKaminoDepositKeysignPayload = async ({
  vault,
  coin,
  amount,
  hexPublicKey,
  vaultId,
  localPartyId,
  libType,
}: BuildKaminoDepositKeysignPayloadInput): Promise<KeysignPayload> => {
  const built = await buildKaminoDepositTransaction({
    owner: coin.address,
    vaultAddress: vault.descriptor.address,
    amount,
  })

  const parsed = parseKaminoWireTransaction(built)
  if (!parsed) {
    throw new Error('Kamino returned a transaction this app cannot read')
  }

  // A sampled price, bounded on both sides: above the ceiling is SOL spent for
  // nothing, below the floor is a transaction that will not land before its
  // blockhash expires. A sample that fails or stalls falls back to the floor
  // rather than holding up the signing path.
  const sampled = await attempt(() => getDynamicPriorityFeePrice())
  const sampledPrice = 'data' in sampled ? sampled.data : undefined
  const unitPriceMicroLamports = clampKaminoUnitPrice(
    sampledPrice === undefined
      ? kaminoComputeBudget.fallbackUnitPriceMicroLamports
      : BigInt(sampledPrice)
  )

  const withBudget = injectKaminoComputeBudget({
    transaction: parsed,
    unitLimit: kaminoExpectedUnitLimit({
      operation: 'deposit',
      descriptor: vault.descriptor,
    }),
    unitPriceMicroLamports,
  })

  const transaction = await refreshKaminoRecentBlockhash(
    injectKaminoAttributionMemo(withBudget)
  )

  await validateKaminoTransactionOnline({
    transaction,
    intent: {
      operation: { deposit: amount },
      vault,
      owner: coin.address,
      priorityFee: {
        unitLimit: kaminoExpectedUnitLimit({
          operation: 'deposit',
          descriptor: vault.descriptor,
        }),
        unitPriceMicroLamports,
      },
      carriesAttributionMemo: true,
    },
  })

  return create(KeysignPayloadSchema, {
    coin: toCommCoin({ ...coin, hexPublicKey }),
    toAddress: vault.descriptor.address,
    toAmount: amount.baseUnits.toString(),
    memo: '',
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    signData: {
      case: 'signSolana',
      value: create(SignSolanaSchema, {
        rawTransactions: [serializeKaminoWireTransaction(transaction)],
      }),
    },
  })
}
