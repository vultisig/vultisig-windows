import { create } from '@bufbuild/protobuf'
import { getResolvedQuery, pendingQuery, Query } from '@lib/ui/query/Query'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { renderToString } from 'react-dom/server'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

// Modelled on the ETH send investigated for #5109: Max on a balance of
// 0.000354053989914981 ETH at a form fee estimate of 0.0000247430966996 ETH.
const requestedAmount = 329_310_893_215_381n

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options: Record<string, string>) =>
      `${key} ${JSON.stringify(options)}`,
  }),
}))
vi.mock('../state/amount', () => ({
  useSendAmount: () => [requestedAmount, () => {}],
}))
vi.mock('../state/sendCoin', () => ({
  useCurrentSendCoin: () => chainFeeCoin[Chain.Ethereum],
}))

import { SendAmountReducedWarning } from './SendAmountReducedWarning'

const render = (keysignPayloadQuery: Query<KeysignPayload>) =>
  renderToString(
    <ThemeProvider theme={darkTheme}>
      <SendAmountReducedWarning keysignPayloadQuery={keysignPayloadQuery} />
    </ThemeProvider>
  )

const renderWithPayloadAmount = (toAmount: bigint) =>
  render(
    getResolvedQuery(
      create(KeysignPayloadSchema, { toAmount: toAmount.toString() })
    )
  )

describe('SendAmountReducedWarning', () => {
  it('shows both exact amounts when the payload signs less than the form amount', () => {
    // The fee re-read for the payload rose to 0.00002486 ETH.
    const html = renderWithPayloadAmount(329_193_989_914_981n)

    expect(html).toContain('send_amount_reduced_at_review')
    expect(html).toContain('0.000329193989914981 ETH')
    expect(html).toContain('0.000329310893215381 ETH')
  })

  it('stays silent when the payload signs the form amount', () => {
    expect(renderWithPayloadAmount(requestedAmount)).toBe('')
  })

  it('stays silent while the payload is being built', () => {
    expect(render(pendingQuery)).toBe('')
  })
})
