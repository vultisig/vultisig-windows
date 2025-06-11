import { IKeysignTransactionPayload } from '@clients/extension/src/utils/interfaces'
import { EvmChain } from '@core/chain/Chain'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import {
  EvmFeeSettingsForm,
  EvmFeeSettingsFormValue,
} from '@core/ui/vault/send/fee/settings/evm/EvmFeeSettingsForm'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { GasPumpIcon } from '@lib/ui/icons/GasPumpIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { useState } from 'react'
import { formatUnits } from 'viem'

type GasFeeAdjusterProps = {
  keysignPayload: KeysignMessagePayload
  onFeeChange: (fee: number, gasLimit: number) => void
  baseFee: number
}

export const GasFeeAdjuster = ({
  keysignPayload,
  onFeeChange,
  baseFee,
}: GasFeeAdjusterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  // Initialize gas settings state with values from transaction payload or fallback to defaults
  // For custom messages: uses Ethereum defaults
  // For regular transactions: uses values from transaction payload with fallbacks
  const [value, setValue] = useState<EvmFeeSettingsFormValue>(() => {
    if (!('keysign' in keysignPayload)) {
      // If we don't have chain information, fallback to Ethereum
      return {
        priorityFee: baseFee,
        gasLimit: getEvmGasLimit({
          chain: EvmChain.Ethereum,
          isNativeToken: true,
        }),
      }
    }
    const transactionPayload =
      keysignPayload.keysign as unknown as IKeysignTransactionPayload

    const isNative = keysignPayload.keysign.coin?.isNativeToken ?? false
    const defaultGasLimit = getEvmGasLimit({
      chain: transactionPayload.chain as EvmChain,
      isNativeToken: isNative,
    })

    return {
      priorityFee:  Number(
            formatUnits(
              BigInt(
                transactionPayload.transactionDetails?.gasSettings?.maxPriorityFeePerGas || 0
              ),
              gwei.decimals
            )
          ),
      gasLimit:
        Number(transactionPayload.transactionDetails?.gasSettings?.gasLimit) ||
        defaultGasLimit,
    }
  })

  const handleSave = () => {
    if ('keysign' in keysignPayload) {
      onFeeChange(value.priorityFee, value.gasLimit)
      setIsOpen(false)
    }
  }

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)}>
        <IconWrapper style={{ fontSize: 16 }}>
          <GasPumpIcon />
        </IconWrapper>
      </IconButton>
      {isOpen && (
        <EvmFeeSettingsForm
          value={value}
          onChange={setValue}
          onSave={handleSave}
          onClose={() => setIsOpen(false)}
          baseFee={baseFee}
        />
      )}
    </>
  )
}
