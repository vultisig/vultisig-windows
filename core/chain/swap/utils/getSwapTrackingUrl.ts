import { Chain } from '@core/chain/Chain'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { KeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

type GetSwapTrackingUrlInput = {
  swapPayload: KeysignSwapPayload
  txHash: string
  sourceChain: Chain
}

export const getSwapTrackingUrl = ({
  swapPayload,
  txHash,
  sourceChain,
}: GetSwapTrackingUrlInput): string => {
  return matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
    native: ({ chain }) => {
      if (chain === Chain.THORChain) {
        return `https://runescan.io/tx/${stripHexPrefix(txHash)}`
      }
      return getBlockExplorerUrl({
        chain,
        entity: 'tx',
        value: txHash,
      })
    },
    general: ({ provider }) => {
      if (provider === 'li.fi') {
        return `https://scan.li.fi/tx/${txHash}`
      }
      return getBlockExplorerUrl({
        chain: sourceChain,
        entity: 'tx',
        value: txHash,
      })
    },
  })
}
