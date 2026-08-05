import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { areLimitOrdersCancelIndistinguishable } from '@vultisig/core-chain/swap/native/limitSwapCancelBucket'
import {
  getLimitSwapCancelEligibility,
  LimitSwapCancelBlocker,
} from '@vultisig/core-chain/swap/native/limitSwapCancelEligibility'
import {
  buildCancelLimitSwapMemo,
  LimitSwapCancelInputs,
} from '@vultisig/core-chain/swap/native/limitSwapCancelMemo'
import { getThorchainMemoAssetSourceChain } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { attempt } from '@vultisig/lib-utils/attempt'

import {
  LimitSwapTransactionRecord,
  TransactionRecord,
} from '../../../../transaction-history/core'
import { useCurrentVaultCoins } from '../../../state/currentVaultCoins'
import { toLimitSwapCancelCandidate } from './candidate'

/**
 * What cancelling this order would take, or why it is unavailable.
 *
 * A record union rather than a nullable "cancellable" flag: every unavailable
 * case here is one the user is owed an explanation for, and an absent button
 * would just send them looking for it.
 */
export type LimitOrderCancelState =
  | { blocked: LimitSwapCancelBlocker }
  /**
   * The order qualifies, but this vault holds no coin to send the cancel from.
   * Names the asset to add — per route, since a Bitcoin-funded order's cancel is
   * sent from Bitcoin and telling that user to add RUNE fixes nothing.
   */
  | { missingSigningCoin: { ticker: string; chain: Chain } }
  | {
      ready: {
        inputs: LimitSwapCancelInputs
        memo: string
        /** The funding chain's gas asset — a cancel moves nothing of its own. */
        signingCoin: AccountCoin
        /**
         * Other resting orders this same cancel would also address. THORChain
         * matches on `(assets, ratio) + sender` and closes the FIRST hit, never
         * by tx hash, so with more than zero we cannot promise which one closes.
         */
        indistinguishableOrderCount: number
      }
    }

const isLimitSwapRecord = (
  record: TransactionRecord
): record is LimitSwapTransactionRecord => record.type === 'limitSwap'

type UseLimitOrderCancelInput = {
  record: LimitSwapTransactionRecord
  /** Every record in the vault's history, for the duplicate-bucket check. */
  records: TransactionRecord[]
}

/**
 * Resolve whether a stored limit order can be cancelled from this device.
 *
 * Two independent questions, answered in order, because they have different
 * answers and different fixes: first whether the ORDER can be cancelled at all
 * (the SDK's fail-closed eligibility, which refuses at every unknown rather than
 * signing a cancel that would silently match nothing), and only then whether
 * this VAULT can sign it.
 */
export const useLimitOrderCancel = ({
  record,
  records,
}: UseLimitOrderCancelInput): LimitOrderCancelState => {
  const vaultCoins = useCurrentVaultCoins()

  const eligibility = getLimitSwapCancelEligibility(
    toLimitSwapCancelCandidate(record.data)
  )

  if ('blocked' in eligibility) {
    return { blocked: eligibility.blocked }
  }

  const { cancellable: inputs } = eligibility

  // Eligibility already proved the memo builds — it builds one itself to check
  // the byte budget — so a throw here would mean the two disagree.
  const memo = attempt(() => buildCancelLimitSwapMemo(inputs))
  if ('error' in memo) {
    return { blocked: 'missingSignedData' }
  }

  // Derived from the RESOLVED source asset, not from the record's own
  // `fromChain`. Those normally agree, but the resolved asset is what the memo
  // will carry and therefore what THORChain checks the sender against
  // (`From.IsChain(Source.Asset.GetChain())`) — so it is the only authority that
  // cannot disagree with the transaction being signed. `GetChain()` semantics
  // also put a secured-asset order on THORChain, where it is custodied, rather
  // than on the chain it originates from.
  const sourceChain = getThorchainMemoAssetSourceChain(inputs.sourceAsset)

  if (!sourceChain) {
    return { blocked: 'unroutableSourceChain' }
  }

  const feeCoin = chainFeeCoin[sourceChain]
  const signingCoin = vaultCoins.find(coin => areEqualCoins(coin, feeCoin))

  if (!signingCoin) {
    return {
      missingSigningCoin: { ticker: feeCoin.ticker, chain: sourceChain },
    }
  }

  const indistinguishableOrderCount = records
    .filter(isLimitSwapRecord)
    .filter(other => other.id !== record.id)
    // Resting only, and from the same sender: THORChain scans the bucket for a
    // swap whose `FromAddress` matches, so an order that is not in the queue or
    // not from this address cannot be the one it hits.
    .filter(other => other.data.orderStatus === 'resting')
    .filter(other => other.data.fromAddress === record.data.fromAddress)
    .filter(other => {
      const otherEligibility = getLimitSwapCancelEligibility(
        toLimitSwapCancelCandidate(other.data)
      )
      return (
        'cancellable' in otherEligibility &&
        areLimitOrdersCancelIndistinguishable(
          inputs,
          otherEligibility.cancellable
        )
      )
    }).length

  return {
    ready: {
      inputs,
      memo: memo.data,
      signingCoin,
      indistinguishableOrderCount,
    },
  }
}
