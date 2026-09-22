/**
 * Why a send failed, in terms history can explain. Only `expired` so far: the
 * chain proved the transaction could no longer be included — a Solana signature
 * still unseen past its blockhash's last valid block height, a Tron transaction
 * past its expiration — so it never went through and nothing left the wallet.
 *
 * Listed rather than declared as a union so a stored value can be checked
 * against it: records outlive the build that wrote them, and one written by a
 * newer build carries a reason this build has no wording for.
 */
export const sendFailureReasons = ['expired'] as const

/** A recognised send failure, narrow enough that history has wording for it. */
export type SendFailureReason = (typeof sendFailureReasons)[number]
