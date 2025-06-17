import { IKeysignTransactionPayload } from '@clients/extension/src/utils/interfaces'
import { Chain, EvmChain } from '@core/chain/Chain'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import {
  EvmFeeSettingsForm,
  EvmFeeSettingsFormValue,
} from '@core/ui/vault/send/fee/settings/evm/EvmFeeSettingsForm'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useState } from 'react'
import { formatUnits } from 'viem'

type GasFeeAdjusterProps = {
  keysignPayload: KeysignMessagePayload
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
  // Initialize gas settings state with values from transaction payload or fallback to defaults
  // For custom messages: uses Ethereum defaults
  // For regular transactions: uses values from transaction payload with fallbacks
  const [value, setValue] = useState<EvmFeeSettingsFormValue>(() => {
    return matchRecordUnion(keysignPayload, {
      keysign: payload => {
        const transactionPayload =
          payload as unknown as IKeysignTransactionPayload
        const isNative = payload.coin?.isNativeToken ?? false
        const defaultGasLimit = getEvmGasLimit({
          chain: transactionPayload.chain as EvmChain,
          isNativeToken: isNative,
        })

        return {
          priorityFee: Number(
            formatUnits(
              BigInt(
                transactionPayload.transactionDetails?.gasSettings
                  ?.maxPriorityFeePerGas || 0
              ),
              gwei.decimals
            )
          ),
          gasLimit: gasLimit || defaultGasLimit,
        }
      },
      custom: () => ({
        priorityFee: baseFee,
        gasLimit: getEvmGasLimit({
          chain: EvmChain.Ethereum,
          isNativeToken: true,
        }),
      }),
    })
  })

  const handleSave = () => {
    if ('keysign' in keysignPayload) {
      onFeeChange(value.priorityFee, value.gasLimit)
      setIsOpen(false)
    }
  }

  const chain = matchRecordUnion(keysignPayload, {
    keysign: payload => getKeysignChain(payload) as Chain,
    custom: () => EvmChain.Ethereum,
  })

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
          chain={chain as EvmChain}
        />
      )}
    </>
  )
}
