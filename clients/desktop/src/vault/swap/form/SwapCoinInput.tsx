import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

import { useWhitelistedCoinsQuery } from '../../../coin/query/useWhitelistedCoinsQuery'
import { CoinInputContainer } from '../../../coin/ui/inputs/CoinInputContainer'
import { SelectCoinOverlay } from '../../../coin/ui/inputs/SelectCoinOverlay'
import { Opener } from '../../../lib/ui/base/Opener'
import { InputProps } from '../../../lib/ui/props'
import { useCurrentVaultCoin } from '../../state/currentVault'
import { useFromCoin } from '../state/fromCoin'
import { SwapCoinBalance } from './SwapCoinBalance'

export const SwapCoinInput: React.FC<InputProps<CoinKey>> = ({
  value,
  onChange,
}) => {
  const [coin] = useFromCoin()

  const selectedCoin = useCurrentVaultCoin(value)

  console.log('[SwapCoinInput] Current Coin:', selectedCoin)

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

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <CoinInputContainer
          value={{
            ...{
              id: selectedCoin.id,
              chain: selectedCoin.chain,
            },
            ...pick(selectedCoin, ['logo', 'ticker']),
          }}
          onClick={onOpen}
        >
          <SwapCoinBalance
            value={{
              id: selectedCoin.id,
              chain: selectedCoin.chain,
            }}
          />
        </CoinInputContainer>
      )}
      renderContent={({ onClose }) => (
        <SelectCoinOverlay
          onFinish={(newValue: any | undefined) => {
            if (newValue) {
              const coinKey: CoinKey = {
                id: newValue.id,
                chain: newValue.chain,
              }
              onChange(coinKey)
            }
            onClose()
          }}
          options={coins}
        />
      )}
    />
  )
}
