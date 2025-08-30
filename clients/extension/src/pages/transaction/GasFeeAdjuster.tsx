import { IKeysignTransactionPayload } from '@clients/extension/src/utils/interfaces'
import { EvmChain } from '@core/chain/Chain'
import { estimateEvmGasWithFallback } from '@core/chain/tx/fee/evm/estimateGasWithFallback'
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
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useEffect, useMemo, useState } from 'react'
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
  const chain = useMemo(() => {
    return matchRecordUnion(keysignPayload, {
      keysign: payload => getKeysignChain(payload) as EvmChain,
      custom: custom => {
        if (custom.chain) return custom.chain as EvmChain
        return EvmChain.Ethereum
      },
    })
  }, [keysignPayload])
  const [isOpen, setIsOpen] = useState(false)

  const [value, setValue] = useState<EvmFeeSettingsFormValue>(() => {
    return matchRecordUnion(keysignPayload, {
      keysign: payload => {
        const transactionPayload =
          payload as unknown as IKeysignTransactionPayload

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
          gasLimit:
            gasLimit ||
            getEvmGasLimit({
              chain: chain as EvmChain,
              isNativeToken: payload.coin?.isNativeToken ?? false,
            }),
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

  useEffect(() => {
    const updateGasLimit = async () =>
      matchRecordUnion(keysignPayload, {
        keysign: async payload => {
          const estimatedGasLimit = await estimateEvmGasWithFallback({
            chain: getKeysignChain(payload),
            from: shouldBePresent(payload.coin).address,
            to: shouldBePresent(payload.toAddress),
            data: payload.memo,
            value: payload.toAmount,
          })

          setValue(prev => ({
            ...prev,
            gasLimit: gasLimit || estimatedGasLimit,
          }))
        },
        custom: async () => {},
      })

    updateGasLimit()
  }, [keysignPayload, gasLimit])

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
