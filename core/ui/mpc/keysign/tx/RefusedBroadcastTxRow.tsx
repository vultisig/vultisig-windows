import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text, TextColor } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'

type RefusedBroadcastTxRowProps = {
  chain: Chain
  hash: string
}

/**
 * One transaction this device signed but refused to broadcast: the hash with
 * copy/explorer controls plus a live chain-state poll. Co-signing devices
 * broadcast independently, so the status flips to the real on-chain outcome
 * the moment one of them lands the same signed transaction.
 */
export const RefusedBroadcastTxRow = ({
  chain,
  hash,
}: RefusedBroadcastTxRowProps) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const [, copyToClipboard] = useCopyToClipboard()
  const { data } = useTxStatusQuery({ chain, hash })

  const status = data?.status ?? 'pending'

  const [statusText, statusColor] = match<typeof status, [string, TextColor]>(
    status,
    {
      pending: () => [t('pending'), 'shy'],
      not_found: () => [t('not_seen_onchain'), 'warning'],
      success: () => [t('confirmed'), 'success'],
      error: () => [t('failed'), 'danger'],
    }
  )

  return (
    <VStack gap={16}>
      <HStack alignItems="center" gap={4} justifyContent="space-between">
        <Text color="shy" weight="500">
          {t('tx_hash')}
        </Text>
        <HStack alignItems="center" gap={4}>
          <MiddleTruncate text={hash} width={140} />
          <IconButton onClick={() => copyToClipboard(hash)}>
            <ClipboardCopyIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              openUrl(getBlockExplorerUrl({ chain, entity: 'tx', value: hash }))
            }
          >
            <SquareArrowOutUpRightIcon />
          </IconButton>
        </HStack>
      </HStack>
      <HStack alignItems="center" gap={4} justifyContent="space-between">
        <Text color="shy" weight="500">
          {t('status')}
        </Text>
        <Text color={statusColor} weight="500">
          {statusText}
        </Text>
      </HStack>
    </VStack>
  )
}
