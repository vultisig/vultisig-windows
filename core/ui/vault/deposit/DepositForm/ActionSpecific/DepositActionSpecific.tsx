import { PartialMatch } from '@lib/ui/base/PartialMatch'
import { ValueProp } from '@lib/ui/props'
import { useWatch } from 'react-hook-form'

import { ChainAction } from '../../ChainAction'
import { useGetMayaChainBondableAssetsQuery } from '../../hooks/useGetMayaChainBondableAssetsQuery'
import { useDepositFormHandlers } from '../../providers/DepositFormHandlersProvider'
import { BondUnbondLPSpecific } from './BondUnboldLPSpecific/BondUnbondLPSpecific'
import { FreezeSpecific } from './FreezeSpecific/FreezeSpecific'
import { TronUnfreezeSpecific } from './FreezeSpecific/TronUnfreezeSpecific'
import { IBCTransferSpecific } from './IBCTransferSpecific/IBCTransferSpecific'
import { MergeSpecific } from './MergeSpecific/MergeSpecific'
import { MintSpecific } from './MintUnmintSpecific/MintSpecific/MintSpecific'
import { RedeemSpecific } from './MintUnmintSpecific/RedeemSpecific/RedeemSpecific'
import { StakeSpecific } from './StakeSpecific/StakeSpecific'
import { UnstakeSpecific } from './StakeSpecific/UnstakeSpecific/UnstakeSpecific'
import { SwitchSpecific } from './SwitchSpecific'
import { UnmergeSpecific } from './UnmergeSpecific/UnmergeSpecific'
import { WithdrawRujiRewardsSpecific } from './WithdrawRujiRewardsSpecific'

export const DepositActionSpecific = ({ value }: ValueProp<ChainAction>) => {
  const { data: bondableAssets = [] } = useGetMayaChainBondableAssetsQuery()
  const [{ control }] = useDepositFormHandlers()
  const selectedBondableAsset = useWatch({ control, name: 'bondableAsset' })

  return (
    <PartialMatch
      value={value}
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
        merge: () => <MergeSpecific />,
        switch: () => <SwitchSpecific />,
        unstake: () => <UnstakeSpecific />,
        stake: () => <StakeSpecific />,
        unmerge: () => <UnmergeSpecific />,
        mint: () => <MintSpecific />,
        redeem: () => <RedeemSpecific />,
        withdraw_ruji_rewards: () => <WithdrawRujiRewardsSpecific />,
        freeze: () => <FreezeSpecific />,
        unfreeze: () => <TronUnfreezeSpecific />,
      }}
      else={() => null}
    />
  )
}
