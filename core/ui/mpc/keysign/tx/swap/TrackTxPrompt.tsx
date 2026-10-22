import { useOpenExternalUrl } from '@core/ui/navigation/hooks/useOpenExternalUrl'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { TitleProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { attempt } from '@vultisig/lib-utils/attempt'
import { truncateId } from '@vultisig/lib-utils/string/truncate'
import { useTranslation } from 'react-i18next'

type TrackTxPromptProps = TitleProp &
  ValueProp<string> & {
    explorerUrl: string
  }

/**
 * A transaction hash row with controls to copy the full hash, confirmed by a
 * toast, and to open it on its block explorer.
 */
export const TrackTxPrompt = ({
  title,
  value,
  explorerUrl,
}: TrackTxPromptProps) => {
  const openExternalUrl = useOpenExternalUrl()
  const { t } = useTranslation()
  const { addToast } = useToast()

  const copyHash = async () => {
    const result = await attempt(() => navigator.clipboard.writeText(value))

    if ('data' in result) {
      addToast({ message: t('tx_hash_copied') })
    } else {
      addToast({ message: t('failed_to_copy_tx_hash'), status: 'error' })
    }
  }

  return (
    <HStack fullWidth justifyContent="space-between" alignItems="center">
      <Text weight="500" size={14} color="shy">
        {title}
      </Text>
      <HStack
        gap={4}
        alignItems="center"
        data-testid="tx-hash"
        data-hash={value}
      >
        <Text weight="500" size={14} color="contrast">
          {truncateId(value)}
        </Text>
        <IconButton
          data-testid="tx-hash-copy"
          aria-label={t('copy')}
          onClick={copyHash}
          size="sm"
        >
          <ClipboardCopyIcon />
        </IconButton>
        <IconButton
          data-testid="tx-hash-explorer"
          onClick={() => openExternalUrl(explorerUrl)}
          size="sm"
        >
          <SquareArrowOutUpRightIcon />
        </IconButton>
      </HStack>
    </HStack>
  )
}
