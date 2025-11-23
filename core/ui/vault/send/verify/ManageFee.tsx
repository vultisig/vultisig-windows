import { toChainKindRecordUnion } from '@core/chain/ChainKind'
import {
  byteFeeMultiplier,
  UtxoFeeSettings,
} from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import {
  EvmFeeSettings,
  FeeSettings,
  FeeSettingsChain,
} from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { getBlockchainSpecificValue } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { EvmFeeSettingsForm } from '@core/ui/vault/send/fee/settings/evm/EvmFeeSettingsForm'
import { UtxoFeeSettingsForm } from '@core/ui/vault/send/fee/settings/utxo/UtxoFeeSettingsForm'
import { ControlledValue } from '@lib/ui/base/ControlledValue'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'

type ManageFeeProps = {
  keysignPayload: KeysignPayload
  feeSettings?: FeeSettings
  onChange: (value: FeeSettings) => void
  chain: FeeSettingsChain
}

export const ManageFee = ({
  keysignPayload,
  feeSettings,
  onChange,
  chain,
}: ManageFeeProps) => {
  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <IconButton onClick={onOpen}>
          <IconWrapper style={{ fontSize: 16 }}>
            <FuelIcon />
          </IconWrapper>
        </IconButton>
      )}
      renderContent={({ onClose }) => (
        <MatchRecordUnion
          value={toChainKindRecordUnion(chain)}
          handlers={{
            evm: chain => {
              const evmSpecific = getBlockchainSpecificValue(
                keysignPayload.blockchainSpecific,
                'ethereumSpecific'
              )

              const baseFee =
                BigInt(evmSpecific.maxFeePerGasWei) -
                BigInt(evmSpecific.priorityFee)

              const initialValue: EvmFeeSettings =
                (feeSettings as EvmFeeSettings) || {
                  maxPriorityFeePerGas: BigInt(evmSpecific.priorityFee),
                  gasLimit: BigInt(evmSpecific.gasLimit),
                }

              return (
                <ControlledValue
                  initialValue={initialValue}
                  render={({ value, onChange: setValue }) => (
                    <EvmFeeSettingsForm
                      value={value}
                      onChange={setValue}
                      onFinish={() => {
                        onChange(value)
                        onClose()
                      }}
                      onClose={onClose}
                      chain={chain}
                      baseFee={baseFee}
                    />
                  )}
                />
              )
            },
            utxo: () => {
              const utxoSpecific = getBlockchainSpecificValue(
                keysignPayload.blockchainSpecific,
                'utxoSpecific'
              )
              const payloadByteFee = BigInt(utxoSpecific.byteFee)

              const initialValue: UtxoFeeSettings =
                (feeSettings as UtxoFeeSettings) ?? {
                  priority: 'normal',
                }

              const getByteFee = () => {
                if (feeSettings && 'priority' in feeSettings) {
                  const multiplier = byteFeeMultiplier[feeSettings.priority]
                  return BigInt(Math.round(Number(payloadByteFee) / multiplier))
                }

                return payloadByteFee
              }

              return (
                <ControlledValue
                  initialValue={initialValue}
                  render={({ value, onChange: setValue }) => (
                    <UtxoFeeSettingsForm
                      value={value}
                      onChange={setValue}
                      onFinish={() => {
                        onChange(value)
                        onClose()
                      }}
                      onClose={onClose}
                      byteFee={getByteFee()}
                    />
                  )}
                />
              )
            },
          }}
        />
      )}
    />
  )
}
