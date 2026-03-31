import { initWasm } from '@trustwallet/wallet-core'
import { memoizeAsync } from '@vultisig/lib-utils/memoizeAsync'

export const getWalletCore = memoizeAsync(initWasm)
