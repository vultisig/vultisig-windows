import { Chain } from '@core/chain/Chain'
import { getSwapTrackingUrl } from '@core/chain/swap/utils/getSwapTrackingUrl'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { KeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { TitleProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { truncateId } from '@lib/utils/string/truncate'

type TrackTxPromptProps = TitleProp &
  ValueProp<string> & {
    chain: Chain
    swapPayload?: KeysignSwapPayload
    sourceChain?: Chain
  }

export const TrackTxPrompt = ({
  title,
  value,
  chain,
  swapPayload,
  sourceChain,
}: TrackTxPromptProps) => {
  const { openUrl } = useCore()

  const trackTransaction = (tx: string) => {
    if (swapPayload && sourceChain) {
      openUrl(
        getSwapTrackingUrl({
          swapPayload,
          txHash: tx,
          sourceChain,
        })
      )
    } else {
      openUrl(
        getBlockExplorerUrl({
          chain,
          entity: 'tx',
          value: tx,
        })
      )
    }
  }

  return (
    <HStack fullWidth justifyContent="space-between" alignItems="center">
      <Text weight="500" size={14} color="shy">
        {title}
      </Text>
      <HStack gap={4} alignItems="center">
        <Text weight="500" size={14} color="contrast">
          {truncateId(value)}
        </Text>
        <IconButton onClick={() => trackTransaction(value)} size="sm">
          <SquareArrowOutUpRightIcon />
        </IconButton>
      </HStack>
    </HStack>
  )
}
