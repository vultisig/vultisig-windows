import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { HorizontalLine } from '../../../components/HorizontalLine'
import { SendCoinInput } from '../../../components/SendCoinInput'
import { SendInputContainer } from '../../../components/SendInputContainer'
import { useCurrentSendCoin } from '../../../state/sendCoin'

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
