import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { EvmFeeSettingsForm } from '@core/ui/vault/send/fee/settings/evm/EvmFeeSettingsForm'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InputProps } from '@lib/ui/props'
import { useState } from 'react'

type ManageEvmFeeProps = InputProps<EvmFeeSettings> & {
  chain: EvmChain
  baseFee: bigint
}

export const ManageEvmFee = ({
  onChange,
  value: initialValue,
  chain,
  baseFee,
}: ManageEvmFeeProps) => {
  const [value, setValue] = useState<EvmFeeSettings>(initialValue)

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
}
