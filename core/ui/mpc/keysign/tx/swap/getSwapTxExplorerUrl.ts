import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { getSwapTrackingUrl } from '@vultisig/core-mpc/swap/utils/getSwapTrackingUrl'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

type GetSwapTxExplorerUrlInput = {
  swapPayload: KeysignSwapPayload
  txHash: string
  sourceChain: Chain
}

/**
 * Links a signed swap transaction to the block explorer of the chain it was
 * signed on — the swap tracker is a separate link. A CowSwap order has no
 * on-chain transaction until it fills, so its hash is the order UID and only
 * the order page can look it up.
 */
export const getSwapTxExplorerUrl = ({
  swapPayload,
  txHash,
  sourceChain,
}: GetSwapTxExplorerUrlInput) => {
  const sourceChainExplorerUrl = () =>
    getBlockExplorerUrl({ chain: sourceChain, entity: 'tx', value: txHash })

  return matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
    native: sourceChainExplorerUrl,
    general: ({ provider }) =>
      provider === 'cowswap'
        ? getSwapTrackingUrl({ swapPayload, txHash, sourceChain })
        : sourceChainExplorerUrl(),
  })
}
