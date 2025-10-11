import { getChainKind } from '@core/chain/ChainKind'
import {
  FeeSettingsChainKind,
  feeSettingsChainKinds,
} from '@core/chain/feeQuote/settings/core'
import { OnCloseProp } from '@lib/ui/props'
import { isOneOf } from '@lib/utils/array/isOneOf'
import React from 'react'

import { useCurrentSendCoin } from '../../state/sendCoin'
import { ManageEvmFeeSettings } from './evm/ManageEvmFeeSettings'
import { ManageFeeSettingsFrame } from './ManageFeeSettingsFrame'
import { ManageUtxoFeeSettings } from './utxo/ManageUtxoFeeSettings'

const ManageFeeComponent: Record<
  FeeSettingsChainKind,
  React.FC<OnCloseProp>
> = {
  evm: ManageEvmFeeSettings,
  utxo: ManageUtxoFeeSettings,
}

export const ManageFeeSettings = () => {
  const { chain } = useCurrentSendCoin()
  const chainKind = getChainKind(chain)

  if (!isOneOf(chainKind, feeSettingsChainKinds)) {
    return null
  }

  const Component = ManageFeeComponent[chainKind]

  return (
    <ManageFeeSettingsFrame
      render={({ onClose }) => <Component onClose={onClose} />}
    />
  )
}
