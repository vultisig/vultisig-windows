import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

type WalletCoreLoadErrorProps = {
  error: unknown
  onRetry: () => void
}

/** Shown in place of the app when the WalletCore WASM failed to load; the action starts the load again. */
export const WalletCoreLoadError = ({
  error,
  onRetry,
}: WalletCoreLoadErrorProps) => {
  const { t } = useTranslation()

  return (
    <FlowErrorPageContent
      title="Failed to load the wallet engine"
      error={error}
      action={<Button onClick={onRetry}>{t('try_again')}</Button>}
    />
  )
}
