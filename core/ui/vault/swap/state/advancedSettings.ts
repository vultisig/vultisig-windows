import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

import { defaultSlippage, SlippageValue } from '../form/advanced/slippage'

type AdvancedSwapSettings = {
  slippage: SlippageValue
  /** Custom EVM gas limit as a digit string; empty means "auto". */
  gasLimit: string
  /** External recipient address; empty means "send to own address". */
  externalRecipient: string
}

const defaultAdvancedSwapSettings: AdvancedSwapSettings = {
  slippage: defaultSlippage,
  gasLimit: '',
  externalRecipient: '',
}

export const [AdvancedSwapSettingsProvider, useAdvancedSwapSettings] =
  setupStateProvider<AdvancedSwapSettings>(
    'AdvancedSwapSettings',
    defaultAdvancedSwapSettings
  )
