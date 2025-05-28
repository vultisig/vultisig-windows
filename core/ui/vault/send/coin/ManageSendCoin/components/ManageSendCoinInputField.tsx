import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { HorizontalLine } from '../../../components/HorizontalLine'
import { SendCoinInput } from '../../../components/SendCoinInput'
import { SendInputContainer } from '../../../components/SendInputContainer'
import { useFocusedSendField } from '../../../providers/FocusedSendFieldProvider'

export const ManageSendCoinInputField = () => {
  const [, setViewState] = useCoreViewState<'send'>()
  const [, setFocusedSendField] = useFocusedSendField()
  const { t } = useTranslation()

  return (
    <SendInputContainer
      onClick={() => {
        setFocusedSendField(state => ({
          field: null,
          fieldsChecked: {
            ...state.fieldsChecked,
            coin: true,
          },
        }))
      }}
    >
      <InputLabel>{t('asset_selection')}</InputLabel>
      <HorizontalLine />
      <SendCoinInput
        value={coin}
        onChange={coin => setViewState(prev => ({ ...prev, coin }))}
      />
    </SendInputContainer>
  )
}
