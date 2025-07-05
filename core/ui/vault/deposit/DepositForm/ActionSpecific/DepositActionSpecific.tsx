import { Coin } from '@core/chain/coin/Coin'
import { PartialMatch } from '@lib/ui/base/PartialMatch'

import { ChainAction } from '../../ChainAction'
import { useGetMayaChainBondableAssetsQuery } from '../../hooks/useGetMayaChainBondableAssetsQuery'
import { useDepositFormHandlers } from '../../providers/DepositFormHandlersProvider'
import { BondUnbondLPSpecific } from './BondUnboldLPSpecific/BondUnbondLPSpecific'
import { IBCTransferSpecific } from './IBCTransferSpecific/IBCTransferSpecific'
import { MergeSpecific } from './MergeSpecific/MergeSpecific'
import { StakeSpecific } from './StakeSpecific/StakeSpecific'
import { UnstakeSpecific } from './StakeSpecific/UnstakeSpecific/UnstakeSpecific'
import { SwitchSpecific } from './SwitchSpecific'
import { UnmergeSpecific } from './UnmergeSpecific/UnmergeSpecific'

type Props = {
  action: ChainAction
}

export const DepositActionSpecific = ({ action }: Props) => {
  const { data: bondableAssets = [] } = useGetMayaChainBondableAssetsQuery()
  const [{ getValues }] = useDepositFormHandlers()
  const selectedBondableAsset = getValues('bondableAsset')
  const selectedCoin = getValues('selectedCoin') as Coin | null

  return (
    <PartialMatch
      value={action}
      if={{
        bond_with_lp: () => (
          <BondUnbondLPSpecific
            assets={bondableAssets}
            selectedAsset={selectedBondableAsset}
          />
        ),
        unbond_with_lp: () => (
          <BondUnbondLPSpecific
            assets={bondableAssets}
            selectedAsset={selectedBondableAsset}
          />
        ),
        ibc_transfer: () => <IBCTransferSpecific />,
        merge: () => <MergeSpecific selectedCoin={selectedCoin} />,
        switch: () => <SwitchSpecific />,
        unstake: () => <UnstakeSpecific />,
        stake: () => <StakeSpecific />,
        unmerge: () => <UnmergeSpecific selectedCoin={selectedCoin} />,
      }}
      else={() => null}
    />
  )
}
