import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { OnCloseProp } from '@lib/ui/props'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { FC, useState } from 'react'

import { useCurrentSendCoin } from '../../../state/sendCoin'
import { EvmFeeSettingsForm } from './EvmFeeSettingsForm'

export const ManageEvmFeeSettings: FC<OnCloseProp> = ({ onClose }) => {
  const coin = useCurrentSendCoin()
  const [persistentValue, setPersistentValue] = useFeeSettings<EvmFeeSettings>()

  const sendChainSpecific = useSendChainSpecific()
  const { gasLimit, priorityFee } = getDiscriminatedUnionValue(
    sendChainSpecific,
    'case',
    'value',
    'ethereumSpecific'
  )

  const [value, setValue] = useState<EvmFeeSettings>(
    () =>
      persistentValue ?? {
        priorityFee: BigInt(priorityFee),
        gasLimit: BigInt(gasLimit),
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
