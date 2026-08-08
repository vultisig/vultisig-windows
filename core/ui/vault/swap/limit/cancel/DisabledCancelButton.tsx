import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type DisabledCancelButtonProps = {
  /** Already translated — one caller formats values into its copy. */
  reason: string
}

/**
 * The Cancel Order action, present but unavailable, with the reason beneath it.
 *
 * Kept visible rather than hidden: every reason that reaches here is permanent
 * for a given order, and several have a reassuring answer the user would
 * otherwise never see — an order whose cancel memo is too long for its source
 * chain still refunds itself at expiry.
 */
export const DisabledCancelButton: FC<DisabledCancelButtonProps> = ({
  reason,
}) => {
  const { t } = useTranslation()

  return (
    <VStack gap={8} alignItems="center">
      <Button kind="secondary" disabled>
        {t('swap_limit_cancel_title')}
      </Button>
      <Text size={12} color="shy" centerHorizontally>
        {reason}
      </Text>
    </VStack>
  )
}
