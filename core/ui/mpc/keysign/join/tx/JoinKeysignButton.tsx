import { Button } from '@lib/ui/buttons/Button'
import { OnClickProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

type JoinKeysignButtonProps = OnClickProp & {
  /** When a string, the button is disabled and the value is shown as a tooltip. */
  disabled?: boolean | string
}

/**
 * Shared "Join Keysign" action used by every joiner verify view so the footer
 * label and styling stay consistent across transfer, swap, LP and custom flows.
 */
export const JoinKeysignButton = ({
  onClick,
  disabled,
}: JoinKeysignButtonProps) => {
  const { t } = useTranslation()

  return (
    <Button onClick={onClick} disabled={disabled}>
      {t('join_keysign')}
    </Button>
  )
}
