import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { decodeSignedTransaction } from '../../transaction-decoding/decodeSignedTransaction'
import { CosmosSignDataReview } from '../../tx/cosmos/getCosmosSignDataReview'
import { getSingleCosmosTransfer } from '../../tx/cosmos/getSingleCosmosTransfer'

/**
 * How the joiner shows Cosmos sign data: a single-amount card whose receiver
 * and amount come from the signed data (`amount` is absent when the signed
 * data states none in the payload's coin), or the per-transfer overview.
 */
type JoinCosmosSignDataView =
  | { overview: true }
  | { card: { receiver: string; amount?: bigint } }

type GetJoinCosmosSignDataViewInput = {
  keysignPayload: KeysignPayload
  review: CosmosSignDataReview
  coin: CoinKey
}

/**
 * Picks the joiner's view for Cosmos sign data. A single transfer, or a single
 * kind of staking or vote action proven from the signed data, keeps the card;
 * anything else gets the overview.
 */
export const getJoinCosmosSignDataView = ({
  keysignPayload,
  review,
  coin,
}: GetJoinCosmosSignDataViewInput): JoinCosmosSignDataView => {
  const transfer = getSingleCosmosTransfer({ review, coin })
  if (transfer) {
    return {
      card: { receiver: transfer.recipient, amount: transfer.amount },
    }
  }

  if (review.hasUnsummarizedMessages || review.transfers.length > 0) {
    return { overview: true }
  }

  const { evidence, amount, counterparty } =
    decodeSignedTransaction(keysignPayload)
  if (evidence !== 'signedData') return { overview: true }

  const denom = coin.id ?? cosmosFeeCoinDenom[review.chain]
  const isCoinAmount =
    amount.kind === 'units' &&
    typeof amount.asset === 'object' &&
    amount.asset.denom === denom

  return {
    card: {
      receiver: counterparty ?? '',
      amount: isCoinAmount ? amount.raw : undefined,
    },
  }
}
