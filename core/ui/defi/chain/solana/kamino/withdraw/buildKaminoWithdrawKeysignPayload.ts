import { create } from '@bufbuild/protobuf'
import { getDynamicPriorityFeePrice } from '@vultisig/core-chain/chains/solana/getDynamicPriorityFeePrice'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { buildKaminoWithdrawTransaction } from '@vultisig/core-chain/chains/solana/kamino/tx/actions'
import {
  clampKaminoUnitPrice,
  kaminoComputeBudget,
  kaminoExpectedUnitLimit,
} from '@vultisig/core-chain/chains/solana/kamino/tx/computeBudget'
import {
  KaminoWithdrawRequest,
  validateKaminoTransactionOnline,
} from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
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

type BuildKaminoWithdrawKeysignPayloadInput = {
  vault: KaminoVaultInfo
  /** The vault's underlying coin, carrying the holder's Solana address. */
  coin: AccountCoin
  /**
   * The shares to burn, and how the position was split when it was read. The
   * split is not decoration: it decides whether the API builds the plain
   * withdraw or the one that releases shares from the farm first, and the
   * validator refuses the shape it was not told to expect.
   */
  request: KaminoWithdrawRequest
  hexPublicKey: string
  vaultId: string
  localPartyId: string
  libType: KeysignLibType
}

/**
 * Builds the keysign payload for one Kamino Earn withdrawal.
 *
 * Same shape and the same ordering contract as the deposit builder — inject
 * the budget and the attribution memo, replace the blockhash, then validate,
 * so what is checked is what is signed — with one asymmetry that matters: the
 * amount here is in SHARES, the inverse of deposit's unit. The API takes the
 * same `amount` field for both actions, so the typed amounts are what keep the
 * two from crossing, and an amount at or above the holder's balance is
 * rewritten by Kamino to `u64::MAX` — withdraw everything. The share count
 * this receives has already been kept strictly below that balance; the
 * validator pins it again against the bytes.
 */
export const buildKaminoWithdrawKeysignPayload = async ({
  vault,
  coin,
  request,
  hexPublicKey,
  vaultId,
  localPartyId,
  libType,
}: BuildKaminoWithdrawKeysignPayloadInput): Promise<KeysignPayload> => {
  const built = await buildKaminoWithdrawTransaction({
    owner: coin.address,
    vaultAddress: vault.descriptor.address,
    shares: request.shares,
  })

  const parsed = parseKaminoWireTransaction(built)
  if (!parsed) {
    throw new Error('Kamino returned a transaction this app cannot read')
  }

  const sampled = await attempt(() => getDynamicPriorityFeePrice())
  const sampledPrice = 'data' in sampled ? sampled.data : undefined
  const unitPriceMicroLamports = clampKaminoUnitPrice(
    sampledPrice === undefined
      ? kaminoComputeBudget.fallbackUnitPriceMicroLamports
      : BigInt(sampledPrice)
  )
  const unitLimit = kaminoExpectedUnitLimit({
    operation: 'withdraw',
    descriptor: vault.descriptor,
  })

  const transaction = await refreshKaminoRecentBlockhash(
    injectKaminoAttributionMemo(
      injectKaminoComputeBudget({
        transaction: parsed,
        unitLimit,
        unitPriceMicroLamports,
      })
    )
  )

  await validateKaminoTransactionOnline({
    transaction,
    intent: {
      operation: { withdraw: request },
      vault,
      owner: coin.address,
      priorityFee: { unitLimit, unitPriceMicroLamports },
      carriesAttributionMemo: true,
    },
  })

  return create(KeysignPayloadSchema, {
    coin: toCommCoin({ ...coin, hexPublicKey }),
    toAddress: vault.descriptor.address,
    // The share count the instruction burns, in share base units — not the
    // token amount the holder receives, which the vault decides at settlement.
    toAmount: request.shares.baseUnits.toString(),
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
