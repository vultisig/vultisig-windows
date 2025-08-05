import { Match } from '@lib/ui/base/Match'

import {
  stakeableAssetsTickers,
  StakeableAssetTicker,
  StakeableChain,
} from '../../../../config'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { StakeSpecific } from '../StakeSpecific'
import { UnstakeTCYSpecific } from './UnstakeTCYSpecific'

export const UnstakeSpecific = () => {
  const [{ setValue, watch, chain, getValues }] = useDepositFormHandlers()

  const selectedCoinTicker = watch('selectedCoin')
    ?.ticker as StakeableAssetTicker

  if (
    !selectedCoinTicker ||
    !stakeableAssetsTickers.includes(selectedCoinTicker)
  ) {
    return null
  }

  return (
    <Match
      value={chain as StakeableChain}
      THORChain={() => (
        <>
          <StakeSpecific />
          <Match
            value={selectedCoinTicker}
            TCY={() => (
              <UnstakeTCYSpecific getValues={getValues} setValue={setValue} />
            )}
          />
        </>
      )}
      Ton={() => null}
    />
  )
}
