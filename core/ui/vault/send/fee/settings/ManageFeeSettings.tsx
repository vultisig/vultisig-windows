import { EvmChain, UtxoChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import {
  FeeSettingsChainKind,
  feeSettingsChainKinds,
} from '@core/chain/feeQuote/settings/core'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { isOneOf } from '@lib/utils/array/isOneOf'
import React from 'react'

import { useCurrentSendCoin } from '../../state/sendCoin'
import { ManageEvmFeeSettings } from './evm/ManageEvmFeeSettings'
import { ManageUtxoFeeSettings } from './utxo/ManageUtxoFeeSettings'

type ManageFeeComponentProps = {
  chain: EvmChain | UtxoChain
  onClose: () => void
}

const ManageFeeComponent: Record<
  FeeSettingsChainKind,
  React.FC<ManageFeeComponentProps>
> = {
  evm: ({ chain, onClose }) => (
    <ManageEvmFeeSettings chain={chain as EvmChain} onClose={onClose} />
  ),
  utxo: ({ chain, onClose }) => (
    <ManageUtxoFeeSettings chain={chain as UtxoChain} onClose={onClose} />
  ),
}

export const ManageFeeSettings = () => {
  const coin = useCurrentSendCoin()
  const chainKind = getChainKind(coin.chain)

  if (!isOneOf(chainKind, feeSettingsChainKinds)) {
    return null
  }

  const Component = ManageFeeComponent[chainKind]

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <IconButton onClick={() => onOpen()}>
          <FuelIcon />
        </IconButton>
      )}
      renderContent={({ onClose }) => (
        <Component
          chain={coin.chain as EvmChain | UtxoChain}
          onClose={onClose}
        />
      )}
    />
  )
}
