// @vitest-environment happy-dom
/**
 * Picking an IBC destination writes it into the deposit form with
 * `setValue`. In the compiled app nothing above this component re-renders it
 * afterwards (the parent hands back a memoized element), so the picker, the
 * destination address and the token list must subscribe to the form
 * themselves. The harness hands back the same element on every render to
 * mirror that.
 */
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { fireEvent, render, screen } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { DepositFormHandlersProvider } from '../../../providers/DepositFormHandlersProvider'
import { FormData } from '../../types'

const atom: AccountCoin = {
  chain: Chain.Cosmos,
  ticker: 'ATOM',
  decimals: 6,
  address: 'cosmos1sender',
}

const osmo: AccountCoin = {
  chain: Chain.Osmosis,
  ticker: 'OSMO',
  decimals: 6,
  address: 'osmo1destination',
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@core/ui/vault/state/currentVaultCoins', () => ({
  useCurrentVaultCoins: () => [atom, osmo],
  useCurrentVaultChainCoins: () => [atom],
}))
vi.mock('../../../providers/DepositCoinProvider', () => ({
  useDepositCoin: () => [atom, vi.fn()],
}))

import { IBCTransferSpecific } from './IBCTransferSpecific'

const Harness = () => {
  const { setValue, getValues, watch, register, control } = useForm<FormData>()

  const [content] = useState(() => (
    <DepositFormHandlersProvider
      initialValue={{
        setValue,
        getValues,
        watch,
        register,
        control,
        chain: Chain.Cosmos,
      }}
    >
      <IBCTransferSpecific />
    </DepositFormHandlersProvider>
  ))

  return content
}

const pickDestination = (label: string) => {
  fireEvent.click(screen.getByText('select_destination_chain'))
  fireEvent.click(screen.getByText(label))
}

describe('IBCTransferSpecific', () => {
  it('shows the picked destination chain and its vault address', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <Harness />
      </ThemeProvider>
    )

    pickDestination('Osmosis OSMO')

    expect(screen.getByText(Chain.Osmosis)).toBeTruthy()
    expect(screen.getByRole('textbox')).toHaveProperty('value', osmo.address)
  })

  it('flags a destination the vault has no address for', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <Harness />
      </ThemeProvider>
    )

    pickDestination('Noble USDC')

    expect(screen.getByRole('textbox')).toHaveProperty(
      'value',
      'missing_destination_address'
    )
  })

  it('offers the tokens the picked destination accepts', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <Harness />
      </ThemeProvider>
    )

    pickDestination('Osmosis OSMO')
    fireEvent.click(screen.getByText(atom.ticker))

    expect(screen.queryByText('no_tokens_found')).toBeNull()
  })
})
