import { rescaleChainAmount } from '@core/ui/chain/utils/rescaleChainAmount'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { HorizontalLine } from '@core/ui/vault/send/components/HorizontalLine'
import { SendCoinInput } from '@core/ui/vault/send/components/SendCoinInput'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

export const ManageSendCoinInputField = () => {
  const [, setViewState] = useCoreViewState<'send'>()
  const { t } = useTranslation()
  const coin = useCurrentSendCoin()
  const coins = useCurrentVaultCoins()

  return (
    <SendInputContainer>
      <InputLabel>{t('asset')}</InputLabel>
      <HorizontalLine />
      <SendCoinInput
        value={coin}
        onChange={nextCoin => {
          const { decimals } = shouldBePresent(
            coins.find(vaultCoin => areEqualCoins(vaultCoin, nextCoin))
          )

          // Emptying the account is a choice made for one account, so it
          // never carries over to another coin. The amount is kept in base
          // units, so it is re-expressed in the new coin's decimals to keep
          // the number the user typed.
          setViewState(prev => ({
            ...prev,
            coin: nextCoin,
            allowDeath: undefined,
            amount:
              prev.amount === undefined
                ? undefined
                : rescaleChainAmount({
                    amount: prev.amount,
                    fromDecimals: coin.decimals,
                    toDecimals: decimals,
                  }),
          }))
        }}
      />
    </SendInputContainer>
  )
}
