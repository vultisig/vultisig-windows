import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

type StartupLoadErrorProps = {
  error: unknown
  onRetry: () => void
}

/** Replaces the app when a startup load, WalletCore or the SDK's MPC engine, failed; the action starts that load again. */
export const StartupLoadError = ({ error, onRetry }: StartupLoadErrorProps) => {
  const { t } = useTranslation()

  return (
    <FlowErrorPageContent
      title={t('failed_to_load')}
      error={error}
      action={<Button onClick={onRetry}>{t('try_again')}</Button>}
    />
  )
}
