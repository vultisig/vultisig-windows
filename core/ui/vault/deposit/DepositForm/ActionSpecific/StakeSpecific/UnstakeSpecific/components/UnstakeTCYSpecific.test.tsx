// @vitest-environment happy-dom
/**
 * Ticking auto-compound swaps the native TCY unstake control for the sTCY
 * one. The checkbox writes the form through its own `Controller`; in the
 * compiled app nothing above this component re-renders it afterwards, so it
 * must subscribe to `autoCompound` itself. The harness hands back the same
 * element on every render to mirror that.
 */
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { fireEvent, render, screen } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { DepositFormHandlersProvider } from '../../../../../providers/DepositFormHandlersProvider'
import { FormData } from '../../../../types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('./UnstakeSTCY', () => ({ UnstakeSTCY: () => 'sTCY unstake' }))
vi.mock('./UnstakeTCYNative', () => ({
  UnstakeTCYNative: () => 'TCY unstake',
}))

import { UnstakeTCYSpecific } from './UnstakeTCYSpecific'

const Harness = () => {
  const { setValue, getValues, watch, register, control } = useForm<FormData>({
    defaultValues: { autoCompound: false },
  })

  const [content] = useState(() => (
    <DepositFormHandlersProvider
      initialValue={{
        setValue,
        getValues,
        watch,
        register,
        control,
        chain: Chain.THORChain,
      }}
    >
      <UnstakeTCYSpecific />
    </DepositFormHandlersProvider>
  ))

  return content
}

describe('UnstakeTCYSpecific', () => {
  it('switches to the sTCY unstake control when auto-compound is ticked', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <Harness />
      </ThemeProvider>
    )

    expect(screen.getByText('TCY unstake')).toBeTruthy()

    fireEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByText('sTCY unstake')).toBeTruthy()
    expect(screen.queryByText('TCY unstake')).toBeNull()
  })
})
