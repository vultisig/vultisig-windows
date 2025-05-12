import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinInputContainer } from '@core/ui/chain/coin/inputs/CoinInputContainer'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { Text } from '@lib/ui/text'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

import { CoinOption } from '../../../chain/coin/inputs/CoinOption'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { SendCoinBalanceDependant } from './balance/SendCoinBalanceDependant'

export const ManageSendCoin = () => {
  const [{ coin: coinKey }, setViewState] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const { t } = useTranslation()
  const options = useCurrentVaultCoins()

  return (
    <InputContainer>
      <InputLabel>{t('asset')}</InputLabel>
      <Opener
        renderOpener={({ onOpen }) => (
          <CoinInputContainer value={coin} onClick={onOpen} />
        )}
        renderContent={({ onClose }) => (
          <SelectItemModal
            title={t('choose_tokens')}
            optionComponent={CoinOption}
            filterFunction={(option, query) =>
              option.ticker.toLowerCase().startsWith(query.toLowerCase())
            }
            onFinish={newValue => {
              if (newValue) {
                setViewState(prev => ({ ...prev, coin: newValue }))
              }
              onClose()
            }}
            options={options}
          />
        )}
      />
      <Text
        centerVertically
        weight="400"
        size={14}
        family="mono"
        color="supporting"
        style={{ gap: 8 }}
      >
        <span>{t('balance')}:</span>
        <SendCoinBalanceDependant
          success={amount => (
            <span>
              {formatTokenAmount(fromChainAmount(amount, coin.decimals))}
            </span>
          )}
        />
      </Text>
    </InputContainer>
  )
}
