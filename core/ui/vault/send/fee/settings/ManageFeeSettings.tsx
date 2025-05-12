import { getChainKind } from '@core/chain/ChainKind'
import { PartialMatch } from '@lib/ui/base/PartialMatch'

import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'
import { ManageEvmFeeSettings } from './evm/ManageEvmFeeSettings'
import { ManageFeeSettingsFrame } from './ManageFeeSettingsFrame'
import { ManageUtxoFeeSettings } from './utxo/ManageUtxoFeeSettings'

export const ManageFeeSettings = () => {
  const [
    {
      coin: { chain },
    },
  ] = useCoreViewState<'send'>()

  const chainKind = getChainKind(chain)

  return (
    <PartialMatch
      value={chainKind}
      if={{
        evm: () => (
          <ManageFeeSettingsFrame
            render={({ onClose }) => <ManageEvmFeeSettings onClose={onClose} />}
          />
        ),
        utxo: () => (
          <ManageFeeSettingsFrame
            render={({ onClose }) => (
              <ManageUtxoFeeSettings onClose={onClose} />
            )}
          />
        ),
      }}
    />
  )
}
