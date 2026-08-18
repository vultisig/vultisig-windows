import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { SwapQuoteCandidate } from '@vultisig/core-chain/swap/quote/findSwapQuote'
import { getSwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/getSwapQuoteProviderName'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import styled from 'styled-components'

import { getSwapQuoteOutput } from '../../queries/swapQuoteOutput'
import { useSwapToCoin } from '../../state/toCoin'
import { SwapFiatAmount } from '../amount/SwapFiatAmount'
import { SwapRouteSubtitle } from './SwapRouteSubtitle'

const logoSize = 24

type SwapRouteOptionProps = {
  value: SwapQuoteCandidate
  isActive: boolean
  onSelect: () => void
}

/**
 * One fetched swap route as a pickable row: who fills it, what it costs, and
 * what it pays out. The payout is the route's own quoted output, so the rows
 * can be compared against each other rather than against the active quote.
 */
export const SwapRouteOption = ({
  value,
  isActive,
  onSelect,
}: SwapRouteOptionProps) => {
  const [toCoinKey] = useSwapToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const { quote } = value
  const providerName = getSwapQuoteProviderName(quote)
  const logoSrc = getSwapProviderLogoSrc(providerName)
  const output = getSwapQuoteOutput({
    quote: quote.quote,
    toCoinKey,
    toCoinDecimals: toCoin.decimals,
  })
  const outputAmount = fromChainAmount(output.amount, output.decimals)

  return (
    <ListItem
      onClick={onSelect}
      icon={
        logoSrc ? (
          <ChainEntityIcon value={logoSrc} style={{ fontSize: logoSize }} />
        ) : undefined
      }
      title={providerName}
      description={<SwapRouteSubtitle quote={quote} />}
      extra={
        <HStack alignItems="center" gap={12}>
          <VStack alignItems="flex-end" gap={2}>
            <Text size={14} weight={500}>
              {formatAmount(outputAmount, { precision: 'high' })}
            </Text>
            <SwapFiatAmount value={{ amount: outputAmount, ...toCoinKey }} />
          </VStack>
          <SelectionIndicator>
            <Checkbox value={isActive} onChange={onSelect} />
          </SelectionIndicator>
        </HStack>
      }
    />
  )
}

// The row is the control; the checkbox only mirrors its state. Letting the
// label swallow pointer events would run `onSelect` twice — once through
// `onChange`, once through the click bubbling up to the row — so clicks pass
// straight through. Keyboard operation still goes through the checkbox, which
// is the only focusable way to pick a route.
const SelectionIndicator = styled.span`
  pointer-events: none;
`
