import {
  HexLabel,
  HexValue,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { MiddleTruncate } from '@lib/ui/truncate'
import { attempt } from '@vultisig/lib-utils/attempt'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type CopyableHexRowProps = {
  label: string
  value: string
}

/**
 * A sign-message detail row for an address or hex value: kept on one line
 * with its middle truncated, plus a button that copies the full value.
 */
export const CopyableHexRow: FC<CopyableHexRowProps> = ({ label, value }) => {
  const { t } = useTranslation()
  const { addToast } = useToast()

  const copy = async () => {
    const result = await attempt(() => navigator.clipboard.writeText(value))

    if ('data' in result) {
      addToast({ message: t('copied') })
    } else {
      addToast({ message: t('failed'), status: 'error' })
    }
  }

  return (
    <HStack
      alignItems="center"
      gap={8}
      justifyContent="space-between"
      wrap="nowrap"
    >
      <HexLabel as="span" color="shy" size={14} weight={500}>
        {label}
      </HexLabel>
      <HexValue alignItems="center" gap={4} justifyContent="end" wrap="nowrap">
        <MiddleTruncate
          justifyContent="end"
          size={14}
          text={value}
          weight={500}
          flexGrow
        />
        <IconButton aria-label={t('copy')} onClick={copy} size="xs">
          <CopyIcon />
        </IconButton>
      </HexValue>
    </HStack>
  )
}
