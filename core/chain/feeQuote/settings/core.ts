import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { UtxoFeeSettings } from '@core/chain/tx/fee/utxo/UtxoFeeSettings'

import { Chain, EvmChain, UtxoChain } from '../../Chain'
import { DeriveChainKind } from '../../ChainKind'

export const feeSettingsChains = [
  ...Object.values(EvmChain),
  ...Object.values(UtxoChain),
] as const satisfies Chain[]

type FeeSettingsChain = (typeof feeSettingsChains)[number]

export type FeeSettingsChainKind = DeriveChainKind<FeeSettingsChain>

export type FeeSettings<T extends FeeSettingsChainKind = FeeSettingsChainKind> =
  T extends 'evm' ? EvmFeeSettings : UtxoFeeSettings
