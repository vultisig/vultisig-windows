import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { OnCloseProp } from '@lib/ui/props'
import { FC, useState } from 'react'

import { useSendFeeQuote } from '../../../queries/useSendFeeQuoteQuery'
import { useCurrentSendCoin } from '../../../state/sendCoin'
import { EvmFeeSettingsForm } from './EvmFeeSettingsForm'

export const ManageEvmFeeSettings: FC<OnCloseProp> = ({ onClose }) => {
  const coin = useCurrentSendCoin()
  const [persistentValue, setPersistentValue] = useFeeSettings<EvmFeeSettings>()

  const { maxPriorityFeePerGas, gasLimit } = useSendFeeQuote<'evm'>()

  const [value, setValue] = useState<EvmFeeSettings>(
    () =>
      persistentValue ?? {
        maxPriorityFeePerGas,
        gasLimit,
      }
  )

  const handleSave = () => {
    setPersistentValue(value)
    onClose()
  }

  return (
    <EvmFeeSettingsForm
      value={value}
      onChange={setValue}
      onFinish={handleSave}
      onClose={onClose}
      chain={coin.chain as EvmChain}
    />
  )
}
