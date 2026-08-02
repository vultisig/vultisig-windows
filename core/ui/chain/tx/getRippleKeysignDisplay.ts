import {
  getLegacyDestinationTag,
  resolveDestinationTag,
} from '@vultisig/core-mpc/keysign/utils/rippleDestinationTag'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

type RippleDisplayInput = {
  destinationTag?: number
  memo?: string
}

export const getRippleDisplay = ({
  destinationTag: explicitDestinationTag,
  memo,
}: RippleDisplayInput) => {
  const normalizedMemo = memo || undefined
  const destinationTag = resolveDestinationTag({
    destinationTag: explicitDestinationTag,
    memo: normalizedMemo,
  })
  const isCompatibilityCarrier =
    normalizedMemo !== undefined &&
    ((explicitDestinationTag === undefined &&
      getLegacyDestinationTag(normalizedMemo) !== undefined) ||
      normalizedMemo === destinationTag?.toString())

  return {
    destinationTag,
    memo: isCompatibilityCarrier ? undefined : normalizedMemo,
  }
}

export const getRippleKeysignDisplay = (value: KeysignPayload) => {
  if (value.blockchainSpecific.case !== 'rippleSpecific') {
    return { destinationTag: undefined, memo: value.memo || undefined }
  }

  return getRippleDisplay({
    destinationTag: value.blockchainSpecific.value.destinationTag,
    memo: value.memo,
  })
}
