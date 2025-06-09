import { IKeysignTransactionPayload } from '@clients/extension/src/utils/interfaces'
import { EvmChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
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
      // For custom messages, we don't have chain information, so fallback to Ethereum
      return {
        priorityFee: baseFee,
        gasLimit: getEvmGasLimit({
          chain: EvmChain.Ethereum,
          isNativeToken: true,
        }), // Fallback to Ethereum for custom messages
      }
    }
    const transactionPayload =
      keysignPayload.keysign as unknown as IKeysignTransactionPayload

    const chain = getKeysignChain(keysignPayload.keysign)
    const chainKind = getChainKind(chain)
    if (chainKind !== 'evm') {
      return {
        priorityFee: baseFee,
        gasLimit: getEvmGasLimit({
          chain: EvmChain.Ethereum,
          isNativeToken: true,
        }), // Fallback to Ethereum if not EVM
      }
    }

    const isNative = keysignPayload.keysign.coin?.isNativeToken ?? false
    const defaultGasLimit = getEvmGasLimit({
      chain: chain as EvmChain,
      isNativeToken: isNative,
    })

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
          : defaultGasLimit,
    }
  })

  if (!('keysign' in keysignPayload)) return null

  const chain = getKeysignChain(keysignPayload.keysign)
  const chainKind = getChainKind(chain)

  if (chainKind !== 'evm') return null

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
