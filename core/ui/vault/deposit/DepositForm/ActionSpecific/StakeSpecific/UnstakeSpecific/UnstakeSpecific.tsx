import { Match } from '@lib/ui/base/Match'

import { StakeableChain } from '../../../../config'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { StakeSpecific } from '../StakeSpecific'
import { UnstakeTCYSpecific } from './UnstakeTCYSpecific'

export const UnstakeSpecific = () => {
  const [{ setValue, watch, chain, getValues }] = useDepositFormHandlers()

  const selectedCoinTicker = watch('selectedCoin')?.ticker

  return (
    <>
      <StakeSpecific />
      <Match
        value={chain as StakeableChain}
        THORChain={() => (
          <>
            <Match
              value={selectedCoinTicker || 'unselected'}
              unselected={() => null}
              TCY={() => (
                <UnstakeTCYSpecific getValues={getValues} setValue={setValue} />
              )}
            />
          </>
        )}
        Ton={() => null}
      />
    </>
  )
}
