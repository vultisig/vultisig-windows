import { create, fromBinary, toBinary } from '@bufbuild/protobuf'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  fee: 1_000_000n,
  pricedCoins: [] as CoinKey[],
}))

vi.mock('../../../chain/coin/price/queries/useCoinPriceQuery', () => ({
  useCoinPriceQuery: ({ coin }: { coin: CoinKey }) => {
    state.pricedCoins.push(coin)
    return { data: coin.id ? 1 : 5 }
  },
}))
vi.mock('../../../chain/hooks/useFormatFiatAmount', () => ({
  useFormatFiatAmount: () => (amount: number) => `$${amount.toFixed(2)}`,
}))
vi.mock('../fee/useKeysignFee', () => ({
  useKeysignFee: () => ({ data: state.fee }),
}))

import { KeysignFeeAmount } from './FeeAmount'

const usdtMaster = 'EQCxE6mUtQJKFnGfaROTKOt2lZb3iiGXPKje1KNWCK4l2DsG'

const renderImportedFee = (gasless: boolean) => {
  const payload = create(KeysignPayloadSchema, {
    coin: {
      chain: Chain.Ton,
      ticker: 'USDT',
      decimals: 6,
      contractAddress: usdtMaster,
      isNativeToken: false,
    },
    blockchainSpecific: {
      case: 'tonSpecific',
      value: { gasless: gasless ? { commission: '1000000' } : undefined },
    },
  })
  const imported = fromBinary(
    KeysignPayloadSchema,
    toBinary(KeysignPayloadSchema, payload)
  )
  return renderToStaticMarkup(
    <ThemeProvider theme={darkTheme}>
      <KeysignFeeAmount keysignPayload={imported} />
    </ThemeProvider>
  )
}

describe('imported TON keysign fee display', () => {
  beforeEach(() => {
    state.fee = 1_000_000n
    state.pricedCoins = []
  })

  it('formats and prices the gasless commission in the transferred jetton', () => {
    const html = renderImportedFee(true)
    expect(html).toContain('1 USDT')
    expect(html).toContain('$1.00')
    expect(html).not.toContain(' GRAM')
    expect(state.pricedCoins).toEqual([
      expect.objectContaining({ chain: Chain.Ton, id: usdtMaster }),
    ])
  })

  it('keeps an ordinary jetton send fee denominated and priced in native TON', () => {
    state.fee = 90_000_000n
    const html = renderImportedFee(false)
    expect(html).toContain('0.09 GRAM')
    expect(html).toContain('$0.45')
    expect(html).not.toContain(' USDT')
    expect(state.pricedCoins).toEqual([
      expect.objectContaining({ chain: Chain.Ton, ticker: 'GRAM' }),
    ])
    expect(state.pricedCoins[0].id).toBeUndefined()
  })
})
