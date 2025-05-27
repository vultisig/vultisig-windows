import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { HorizontalLine } from '../components/HorizontalLine'
import { SendCoinInput } from '../components/SendCoinInput'
import { SendInputContainer } from '../components/SendInputContainer'

export const ManageSendCoin = () => {
  const [{ coin: coinKey }, setViewState] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const { t } = useTranslation()

  return (
    <SendInputContainer>
      <InputLabel>{t('asset_selection')}</InputLabel>
      <HorizontalLine />
      <SendCoinInput
        value={coin}
        onChange={coin => setViewState(prev => ({ ...prev, coin }))}
      />
    </SendInputContainer>
  )
}
