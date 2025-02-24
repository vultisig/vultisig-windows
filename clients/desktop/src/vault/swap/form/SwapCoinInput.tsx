import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

import { useWhitelistedCoinsQuery } from '../../../coin/query/useWhitelistedCoinsQuery'
import { CoinInputContainer } from '../../../coin/ui/inputs/CoinInputContainer'
import { SelectCoinOverlay } from '../../../coin/ui/inputs/SelectCoinOverlay'
import { Opener } from '../../../lib/ui/base/Opener'
import { InputProps } from '../../../lib/ui/props'
import { useFromCoin } from '../state/fromCoin'
import { SwapCoinBalance } from './SwapCoinBalance'

export const SwapCoinInput: React.FC<InputProps<CoinKey>> = ({
  value,
  onChange,
}) => {
  const [coin] = useFromCoin()

  const whitelistedCoins = useWhitelistedCoinsQuery(coin?.chain) || { data: [] }

  console.log('[SwapCoinInput] Whitelisted Coins:', whitelistedCoins.data)

  // Convert whitelisted coins to `Coin[]`
  const coins = useMemo(() => {
    return (whitelistedCoins.data ?? []).map(coin => ({
      id: coin.id,
      chain: coin.chain,
      ticker: coin.ticker || 'UNKNOWN',
      logo: coin.logo || '',
      priceProviderId: coin.priceProviderId || '',
      decimals: coin.decimals || 18,
    })) as Coin[]
  }, [whitelistedCoins.data])

  console.log('[SwapCoinInput] Available Coins:', coins)

  // Convert `Coin[]` to `CoinKey[]` for `onFinish`
  const coinKeyOptions = useMemo(() => {
    return coins.map(({ id, chain }) => ({ id, chain })) as CoinKey[]
  }, [coins])

  console.log('[SwapCoinInput] Available CoinKey Options:', coinKeyOptions)

  // Ensure value has logo/ticker, otherwise use first available option
  const selectedCoin = useMemo(() => {
    return (
      coins.find(c => c.id === value?.id && c.chain === value?.chain) ||
      coins[0] || {
        id: value?.id || 'UNKNOWN',
        chain: value?.chain || 'UNKNOWN',
        ticker: 'UNKNOWN',
        logo: '',
        priceProviderId: '',
        decimals: 18,
      }
    )
  }, [value, coins])

  console.log('[SwapCoinInput] Selected Coin:', selectedCoin)

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <CoinInputContainer
          value={{ ...value, ...pick(selectedCoin, ['logo', 'ticker']) }}
          onClick={onOpen}
        >
          <SwapCoinBalance value={value} />
        </CoinInputContainer>
      )}
      renderContent={({ onClose }) => (
        <SelectCoinOverlay
          onFinish={(newValue: any | undefined) => {
            if (newValue) {
              const coinKey: CoinKey = {
                id: newValue.id,
                chain: newValue.chain,
              } // ✅ Convert `Coin` → `CoinKey`
              onChange(coinKey)
            }
            onClose()
          }}
          options={coins} // ✅ Pass `Coin[]` as expected
        />
      )}
    />
  )
}
