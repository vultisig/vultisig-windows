import { EvmChain } from '@core/chain/Chain'
import { estimateEvmGasWithFallback } from '@core/chain/tx/fee/evm/estimateGasWithFallback'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { EthereumSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  EvmFeeSettingsForm,
  EvmFeeSettingsFormValue,
} from '@core/ui/vault/send/fee/settings/evm/EvmFeeSettingsForm'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect, useState } from 'react'

type GasFeeAdjusterProps = {
  keysignPayload: KeysignPayload
  onFeeChange: (fee: number, gasLimit: number) => void
  baseFee: number
  gasLimit?: number
}

export const GasFeeAdjuster = ({
  keysignPayload,
  onFeeChange,
  gasLimit,
  baseFee,
}: GasFeeAdjusterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { blockchainSpecific } = keysignPayload
  const chain = getKeysignChain(keysignPayload) as EvmChain
  const evmSpecific = blockchainSpecific.value as EthereumSpecific
  const [value, setValue] = useState<EvmFeeSettingsFormValue>(() => {
    return {
      priorityFee: Number(evmSpecific.priorityFee),
      gasLimit:
        gasLimit ||
        getEvmGasLimit({
          chain,
          isNativeToken: keysignPayload.coin?.isNativeToken ?? false,
        }),
    }
  })

  useEffect(() => {
    const updateGasLimit = async () => {
      const estimatedGasLimit = await estimateEvmGasWithFallback({
        chain,
        from: shouldBePresent(keysignPayload.coin).address,
        to: shouldBePresent(keysignPayload.toAddress),
        data: keysignPayload.memo,
        value: keysignPayload.toAmount,
      })

      setValue(prev => ({
        ...prev,
        gasLimit: gasLimit || estimatedGasLimit,
      }))
    }

    updateGasLimit()
  }, [keysignPayload, gasLimit, chain])

  const handleSave = () => {
    onFeeChange(value.priorityFee, value.gasLimit)
    setIsOpen(false)
  }

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)}>
        <IconWrapper style={{ fontSize: 16 }}>
          <FuelIcon />
        </IconWrapper>
      </IconButton>
      {isOpen && (
        <EvmFeeSettingsForm
          value={value}
          onChange={setValue}
          onFinish={handleSave}
          onClose={() => setIsOpen(false)}
          baseFee={baseFee}
          chain={chain}
        />
      )}
    </>
  )
}
