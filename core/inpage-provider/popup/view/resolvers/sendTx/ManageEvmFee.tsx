import { EvmChain } from '@core/chain/Chain'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { useEvmBaseFeeQuery } from '@core/ui/chain/evm/queries/baseFee'
import { EvmFeeSettingsForm } from '@core/ui/vault/send/fee/settings/evm/EvmFeeSettingsForm'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InputProps } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useState } from 'react'

type ManageEvmFeeProps = InputProps<EvmFeeSettings> & {
  chain: EvmChain
}

export const ManageEvmFee = ({
  onChange,
  value: initialValue,
  chain,
}: ManageEvmFeeProps) => {
  const [value, setValue] = useState<EvmFeeSettings>(initialValue)
  const baseFeeQuery = useEvmBaseFeeQuery(chain)

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
        <MatchQuery
          value={baseFeeQuery}
          success={baseFeePerGas => (
            <EvmFeeSettingsForm
              value={value}
              onChange={setValue}
              onFinish={() => {
                onChange(value)
                onClose()
              }}
              onClose={onClose}
              chain={chain}
              baseFeePerGas={baseFeePerGas}
            />
          )}
          pending={() => null}
          error={() => null}
        />
      )}
    />
  )
}
