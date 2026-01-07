import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { SendCoinInput } from '@core/ui/vault/send/components/SendCoinInput'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { useTranslation } from 'react-i18next'

export const ManageSendCoinInputField = () => {
  const [, setViewState] = useCoreViewState<'send'>()
  const { t } = useTranslation()
  const coin = useCurrentSendCoin()

  return (
    <SendInputContainer>
      <InputLabel>{t('asset')}</InputLabel>
      <HorizontalLine />
      <SendCoinInput
        value={coin}
        onChange={coin => {
          setViewState(prev => ({ ...prev, coin }))
        }}
      />
    </SendInputContainer>
  )
}
