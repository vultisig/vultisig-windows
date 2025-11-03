import { toChainKindRecordUnion } from '@core/chain/ChainKind'
import { feeSettingsChains } from '@core/chain/feeQuote/settings/core'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FuelIcon } from '@lib/ui/icons/FuelIcon'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { useCurrentSendCoin } from '../../state/sendCoin'
import { ManageEvmFeeSettings } from './evm/ManageEvmFeeSettings'
import { ManageUtxoFeeSettings } from './utxo/ManageUtxoFeeSettings'

export const ManageFeeSettings = () => {
  const { chain } = useCurrentSendCoin()

  if (!isOneOf(chain, feeSettingsChains)) {
    return null
  }

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <IconButton onClick={() => onOpen()}>
          <FuelIcon />
        </IconButton>
      )}
      renderContent={({ onClose }) => (
        <MatchRecordUnion
          value={toChainKindRecordUnion(chain)}
          handlers={{
            evm: chain => (
              <ManageEvmFeeSettings chain={chain} onClose={onClose} />
            ),
            utxo: chain => (
              <ManageUtxoFeeSettings chain={chain} onClose={onClose} />
            ),
          }}
        />
      )}
    />
  )
}
