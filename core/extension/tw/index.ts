import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { initWasm } from '@trustwallet/wallet-core'

export const getWalletCore = memoizeAsync(initWasm)
