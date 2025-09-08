import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { OnCloseProp } from '@lib/ui/props'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { FC, useEffect, useState } from 'react'

import { useEvmMaxPriorityFeePerGasQuery } from '../../../../../chain/evm/queries/maxPriorityFeePerGas'
import { useCurrentSendCoin } from '../../../state/sendCoin'
import { EvmFeeSettingsForm } from './EvmFeeSettingsForm'

export const ManageEvmFeeSettings: FC<OnCloseProp> = ({ onClose }) => {
  const coin = useCurrentSendCoin()

  const { data: defaultFeePriority = 0, isSuccess } =
    useEvmMaxPriorityFeePerGasQuery(coin.chain as EvmChain)
  const [persistentValue, setPersistentValue] = useFeeSettings<EvmFeeSettings>()

  const sendChainSpecific = useSendChainSpecific()
  const { gasLimit: defaultGasLimit } = getDiscriminatedUnionValue(
    sendChainSpecific,
    'case',
    'value',
    'ethereumSpecific'
  )

  const [value, setValue] = useState<EvmFeeSettings>(
    () =>
      persistentValue ?? {
        priorityFee: Number(defaultFeePriority),
        gasLimit: Number(defaultGasLimit),
      }
  )

  useEffect(() => {
    if (isSuccess && persistentValue?.priorityFee == null) {
      setValue(prev => ({ ...prev, priorityFee: Number(defaultFeePriority) }))
    }
  }, [defaultFeePriority, isSuccess, persistentValue?.priorityFee])

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
      coinKey={coin}
      chain={coin.chain as EvmChain}
    />
  )
}
