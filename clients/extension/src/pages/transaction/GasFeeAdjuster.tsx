import { IKeysignTransactionPayload } from '@clients/extension/src/utils/interfaces'
import { getChainKind } from '@core/chain/ChainKind'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { getKeysignChain } from '@core/ui/mpc/keysign/utils/getKeysignChain'
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
  const [value, setValue] = useState<EvmFeeSettingsFormValue>(() => {
    if (!('keysign' in keysignPayload)) {
      return {
        priorityFee: baseFee,
        gasLimit: 21000,
      }
    }
    console.log('Base Fee in GasFeeAdjuster:', baseFee)
    const transactionPayload =
      keysignPayload.keysign as unknown as IKeysignTransactionPayload
    return {
      priorityFee: transactionPayload.transactionDetails?.gasSettings
        ?.maxPriorityFeePerGas
        ? Number(
            formatUnits(
              BigInt(
                transactionPayload.transactionDetails.gasSettings
                  .maxPriorityFeePerGas
              ),
              gwei.decimals
            )
          )
        : transactionPayload.maxPriorityFeePerGas
          ? Number(
              formatUnits(
                BigInt(transactionPayload.maxPriorityFeePerGas),
                gwei.decimals
              )
            )
          : 0,
      gasLimit: transactionPayload.transactionDetails?.gasSettings?.gasLimit
        ? Number(transactionPayload.transactionDetails.gasSettings.gasLimit)
        : transactionPayload.gasLimit
          ? Number(transactionPayload.gasLimit)
          : 21000,
    }
  })

  if (!('keysign' in keysignPayload)) return null

  const chain = getKeysignChain(keysignPayload.keysign)
  const chainKind = getChainKind(chain)

  if (chainKind !== 'evm') return null

  const handleSave = () => {
    if ('keysign' in keysignPayload) {
      const keysign = keysignPayload.keysign
      const totalFee = baseFee + value.priorityFee

      // Update the transaction fee in the blockchain specific data
      if (keysign.blockchainSpecific && 'evm' in keysign.blockchainSpecific) {
        const evmSpecific = keysign.blockchainSpecific.evm as {
          priorityFee: string
          maxFeePerGasWei: string
          gasLimit?: string
        }
        evmSpecific.priorityFee = value.priorityFee.toString()
        evmSpecific.maxFeePerGasWei = (baseFee * 1.5 + value.priorityFee).toString()
        evmSpecific.gasLimit = value.gasLimit.toString()
      }
      // Update the transaction payload
      const transactionPayload =
        keysign as unknown as IKeysignTransactionPayload
      transactionPayload.maxPriorityFeePerGas = value.priorityFee.toString()
      transactionPayload.maxFeePerGas = (baseFee * 1.5 + value.priorityFee).toString()
      transactionPayload.gasLimit = value.gasLimit.toString()
      transactionPayload.txFee = totalFee.toString()
    }
    onFeeChange(value.priorityFee, value.gasLimit)
    setIsOpen(false)
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
