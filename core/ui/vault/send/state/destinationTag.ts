import { Chain } from '@vultisig/core-chain/Chain'
import {
  decodeRippleXAddress,
  isValidRippleXAddress,
} from '@vultisig/core-chain/chains/ripple/address'
import { useCallback } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useSendReceiver } from './receiver'
import { useCurrentSendCoin } from './sendCoin'

const maxRippleDestinationTag = 0xffffffff

type GetSendDestinationTagInput = {
  chain: Chain
  receiver: string
  value: string
}

type SendDestinationTag = {
  destinationTag?: number
  error: boolean
  isLocked: boolean
  value: string
}

export const getSendDestinationTag = ({
  chain,
  receiver,
  value,
}: GetSendDestinationTagInput): SendDestinationTag => {
  if (chain !== Chain.Ripple) {
    return { destinationTag: undefined, error: false, isLocked: false, value }
  }

  const normalizedReceiver = receiver.trim()
  if (isValidRippleXAddress(normalizedReceiver)) {
    const { destinationTag } = decodeRippleXAddress(normalizedReceiver)
    if (destinationTag !== undefined) {
      return {
        destinationTag,
        error: false,
        isLocked: true,
        value: destinationTag.toString(),
      }
    }
  }

  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return {
      destinationTag: undefined,
      error: false,
      isLocked: false,
      value,
    }
  }

  if (!/^\d+$/.test(normalizedValue)) {
    return {
      destinationTag: undefined,
      error: true,
      isLocked: false,
      value,
    }
  }

  const destinationTag = Number(normalizedValue)
  if (
    !Number.isSafeInteger(destinationTag) ||
    destinationTag > maxRippleDestinationTag
  ) {
    return {
      destinationTag: undefined,
      error: true,
      isLocked: false,
      value,
    }
  }

  return { destinationTag, error: false, isLocked: false, value }
}

export const useSendDestinationTagInput = () => {
  const [state, setState] = useCoreViewState<'send'>()

  const setDestinationTag = useCallback(
    (destinationTag: string | ((prev: string) => string)) => {
      setState(prev => ({
        ...prev,
        destinationTag:
          typeof destinationTag === 'function'
            ? destinationTag(prev.destinationTag ?? '')
            : destinationTag,
      }))
    },
    [setState]
  )

  return [state.destinationTag ?? '', setDestinationTag] as const
}

export const useSendDestinationTag = (): SendDestinationTag => {
  const { chain } = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [value] = useSendDestinationTagInput()

  return getSendDestinationTag({ chain, receiver, value })
}
