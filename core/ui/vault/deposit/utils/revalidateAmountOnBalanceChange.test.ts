import { zodResolver } from '@hookform/resolvers/zod'
import { WalletCore } from '@trustwallet/wallet-core'
import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import type { TFunction } from 'i18next'
import { createFormControl, Resolver } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { FormData } from '../DepositForm/types'
import { getDepositFormConfig } from './getDepositFormConfig'
import { revalidateAmountOnBalanceChange } from './revalidateAmountOnBalanceChange'

// The bond schema runs the node address through WalletCore; these cases are
// about which fields get validated, not about address parsing itself.
vi.mock('@vultisig/core-chain/utils/isValidAddress', () => ({
  isValidAddress: ({ address }: { address: string }) =>
    address.startsWith('thor'),
}))

const t = ((key: string) => key) as TFunction

const coin: AccountCoin = {
  chain: Chain.THORChain,
  ticker: 'RUNE',
  decimals: 8,
  address: 'thor1sender',
}

type SetupBondFormInput = {
  balance: number
  values: FormData
}

// Mirrors DepositForm: the resolver is rebuilt from the latest balance on
// every render, so a balance that arrives late tightens the amount's max.
const setupBondForm = ({ balance, values }: SetupBondFormInput) => {
  let currentBalance = balance

  // Matches DepositForm's own `zodResolver(schema as any)` — the config
  // returns one of many per-action schemas, so it is typed as ZodTypeAny.
  const buildResolver = (): Resolver<FormData> =>
    zodResolver(
      getDepositFormConfig({
        t,
        coin,
        walletCore: {} as WalletCore,
        totalAmountAvailable: currentBalance,
        totalAmountAvailableUnits: toChainAmount(currentBalance, coin.decimals),
        selectedChainAction: 'bond',
      }).schema as any
    )

  const form = createFormControl<FormData>({
    resolver: (formValues, context, options) =>
      buildResolver()(formValues, context, options),
    mode: 'onChange',
    defaultValues: values,
  })

  return {
    ...form,
    setBalance: (value: number) => {
      currentBalance = value
    },
  }
}

describe('revalidateAmountOnBalanceChange', () => {
  it('leaves an untouched form free of errors', async () => {
    const { getValues, trigger, getFieldState } = setupBondForm({
      balance: 10,
      values: { nodeAddress: '', amount: '' },
    })

    await revalidateAmountOnBalanceChange({ getValues, trigger })

    expect(getFieldState('nodeAddress').error).toBeUndefined()
    expect(getFieldState('amount').error).toBeUndefined()
  })

  it('re-checks an entered amount against the new balance', async () => {
    const { getValues, trigger, getFieldState, setBalance } = setupBondForm({
      balance: 10,
      values: { nodeAddress: '', amount: '8' },
    })

    await revalidateAmountOnBalanceChange({ getValues, trigger })
    expect(getFieldState('amount').error).toBeUndefined()

    setBalance(4)
    await revalidateAmountOnBalanceChange({ getValues, trigger })

    expect(getFieldState('amount').error?.message).toBe(
      'chainFunctions.amountExceeded'
    )
  })

  it('re-disables the submit button by keeping isValid in sync', async () => {
    const { getValues, trigger, subscribe, setBalance } = setupBondForm({
      balance: 10,
      values: { nodeAddress: 'thor1node', amount: '8' },
    })

    let isValid = true
    subscribe({
      formState: { isValid: true },
      callback: state => {
        if (state.isValid !== undefined) {
          isValid = state.isValid
        }
      },
    })

    setBalance(4)
    await revalidateAmountOnBalanceChange({ getValues, trigger })

    expect(isValid).toBe(false)
  })

  it('shows what validating the whole form did on mount instead (#4546)', async () => {
    const { trigger, getFieldState } = setupBondForm({
      balance: 10,
      values: { nodeAddress: '', amount: '' },
    })

    await trigger()

    expect(getFieldState('nodeAddress').error?.message).toBe(
      'required_node_address'
    )
  })
})
