import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { Text } from '@lib/ui/text'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

import { CoinInputContainer } from '../../../coin/ui/inputs/CoinInputContainer'
import { CoinOption } from '../../../coin/ui/inputs/CoinOption'
import { SelectItemModal } from '../../../coin/ui/inputs/SelectItemModal'
import { useCurrentSendCoin } from '../state/sendCoin'
import { SendCoinBalanceDependant } from './balance/SendCoinBalanceDependant'

export const ManageSendCoin = () => {
  const [value, setValue] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(value)
  const { t } = useTranslation()
  const options = useCurrentVaultCoins()

  return (
    <InputContainer>
      <InputLabel>{t('asset')}</InputLabel>
      <Opener
        renderOpener={({ onOpen }) => (
          <CoinInputContainer
            value={{ ...value, logo: coin.logo, ticker: coin.ticker }}
            onClick={onOpen}
          />
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
                setValue(newValue)
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
