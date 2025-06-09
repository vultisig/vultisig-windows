import { Chain } from '@core/chain/Chain'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { TitleProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

type TrackTxPromptProps = TitleProp &
  ValueProp<string> & {
    chain: Chain
  }

export const TrackTxPrompt = ({ title, value, chain }: TrackTxPromptProps) => {
  const { openUrl } = useCore()

  const trackTransaction = (tx: string) =>
    openUrl(
      getBlockExplorerUrl({
        chain,
        entity: 'tx',
        value: tx,
      })
    )

  return (
    <HStack fullWidth justifyContent="space-between" alignItems="center">
      <Text weight="500" size={14} color="shy">
        {title}
      </Text>
      <HStack gap={4} alignItems="center">
        <Text
          style={{
            width: 100,
          }}
          cropped
          weight="500"
          size={14}
          color="contrast"
        >
          {value}
        </Text>
        <IconButton onClick={() => trackTransaction(value)} size="sm">
          <SquareArrowOutUpRightIcon />
        </IconButton>
      </HStack>
    </HStack>
  )
}
