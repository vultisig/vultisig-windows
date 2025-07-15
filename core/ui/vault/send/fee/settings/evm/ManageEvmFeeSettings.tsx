import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { EvmChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { useEvmDefaultPriorityFeeQuery } from '@core/chain/tx/fee/evm/hooks/useEvmDefaultPriorityFeeQuery'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { useFeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { OnCloseProp } from '@lib/ui/props'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { FC, useEffect, useState } from 'react'

import { useCurrentSendCoin } from '../../../state/sendCoin'
import {
  EvmFeeSettingsForm,
  EvmFeeSettingsFormValue,
} from './EvmFeeSettingsForm'

export const ManageEvmFeeSettings: FC<OnCloseProp> = ({ onClose }) => {
  const coin = useCurrentSendCoin()

  const { data: defaultFeePriority = 0, isSuccess } =
    useEvmDefaultPriorityFeeQuery({
      chain: coin.chain as EvmChain,
    })
  const chainSpecific = useSendChainSpecific()
  const fee = getFeeAmount(chainSpecific)

  const { decimals } = chainFeeCoin[coin.chain]
  const baseFee = fromChainAmount(fee, decimals)

  const [persistentValue, setPersistentValue] = useFeeSettings<EvmFeeSettings>()

  const sendChainSpecific = useSendChainSpecific()
  const { gasLimit: defaultGasLimit } = getDiscriminatedUnionValue(
    sendChainSpecific,
    'case',
    'value',
    'ethereumSpecific'
  )

  const [value, setValue] = useState<EvmFeeSettingsFormValue>(
    () =>
      persistentValue ?? {
        priorityFee: defaultFeePriority,
        gasLimit: Number(defaultGasLimit),
      }
  )

  useEffect(() => {
    if (isSuccess && persistentValue?.priorityFee == null) {
      setValue(prev => ({ ...prev, priorityFee: defaultFeePriority }))
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
      baseFee={baseFee}
      coinKey={coin}
      chain={coin.chain as EvmChain}
    />
  )
}
