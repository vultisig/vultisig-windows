import { getCosmosSignDataReview } from '@core/ui/mpc/keysign/tx/cosmos/getCosmosSignDataReview'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

/**
 * Fills the payload's recipient, amount and memo from its signed Cosmos data,
 * so every later reader of the payload sees what is signed. The recipient is
 * kept only when all transfers share it, and the amount totals the transfers
 * in the payload's coin. No-op for a payload without Cosmos sign data.
 */
export const applyCosmosSignDataReview = (keysignPayload: KeysignPayload) => {
  const review = getCosmosSignDataReview(keysignPayload)
  if (!review) return

  const coin = shouldBePresent(keysignPayload.coin, 'keysignPayload.coin')
  const denom = coin.isNativeToken
    ? cosmosFeeCoinDenom[review.chain]
    : coin.contractAddress

  const recipients = new Set(review.transfers.map(({ recipient }) => recipient))
  const [recipient] = recipients

  keysignPayload.toAddress = recipients.size === 1 && recipient ? recipient : ''
  keysignPayload.toAmount = review.transfers
    .filter(transfer => transfer.coin.denom === denom)
    .reduce((sum, transfer) => sum + transfer.coin.amount, 0n)
    .toString()
  keysignPayload.memo = review.memo
}
