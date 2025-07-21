import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { useTranslation } from 'react-i18next'

type DepositPromptProps = { coin: CoinKey; totalAmountAvailable: number }

export const DepositPrompt = ({
  coin,
  totalAmountAvailable,
}: DepositPromptProps) => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  const isDisabled = totalAmountAvailable === 0

  const button = (
    <Button
      kind="secondary"
      onClick={() => navigate({ id: 'deposit', state: { coin } })}
      style={{ textTransform: 'uppercase' }}
      disabled={isDisabled}
    >
      {t('deposit')}
    </Button>
  )

  if (isDisabled) {
    return (
      <Tooltip
        content={t('please_deposit_funds_to_use_this_function')}
        renderOpener={props => (
          <span {...props} style={{ display: 'inline-block', width: '100%' }}>
            {button}
          </span>
        )}
      />
    )
  }

  return button
}
