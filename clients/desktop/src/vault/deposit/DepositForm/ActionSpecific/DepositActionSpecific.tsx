import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { Match } from '@lib/ui/base/Match'
import {
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { ChainAction } from '../../ChainAction'
import { useGetMayaChainBondableAssetsQuery } from '../../hooks/useGetMayaChainBondableAssetsQuery'
import { FormData } from '..'
import { BondUnbondLPSpecific } from './BondUnboldLPSpecific/BondUnbondLPSpecific'
import { IBCTransferSpecific } from './IBCTransferSpecific/IBCTransferSpecific'
import { MergeSpecific } from './MergeSpecific/MergeSpecific'
import { StakeTCYSpecific } from './StakeTCYSpecific'
import { SwitchSpecific } from './SwitchSpecificFields'
import { UnstakeTCYSpecific } from './UnstakeTYCSpecific/UnstakeTCYSpecific'

type Props = {
  chain: Chain
  action: ChainAction
  setValue: UseFormSetValue<FormData>
  getValues: UseFormGetValues<FormData>
  watch: UseFormWatch<FormData>
}

export const DepositActionSpecific = ({
  chain,
  action,
  setValue,
  getValues,
  watch,
}: Props) => {
  const { data: bondableAssets = [] } = useGetMayaChainBondableAssetsQuery()
  const selectedBondableAsset = getValues('bondableAsset')
  const selectedCoin = getValues('selectedCoin') as Coin | null

  return (
    <Match
      value={action}
      bond_with_lp={() => (
        <BondUnbondLPSpecific
          assets={bondableAssets}
          selectedAsset={selectedBondableAsset}
          setValue={setValue}
          watch={watch}
        />
      )}
      unbond_with_lp={() => (
        <BondUnbondLPSpecific
          assets={bondableAssets}
          selectedAsset={selectedBondableAsset}
          setValue={setValue}
          watch={watch}
        />
      )}
      ibc_transfer={() => (
        <IBCTransferSpecific
          getValues={getValues}
          setValue={setValue}
          watch={watch}
          chain={chain}
        />
      )}
      merge={() => (
        <MergeSpecific
          selectedCoin={selectedCoin}
          watch={watch}
          setValue={setValue}
        />
      )}
      switch={() => (
        <SwitchSpecific
          watch={watch}
          setValue={setValue}
          getValues={getValues}
        />
      )}
      unstake_tcy={() => <UnstakeTCYSpecific setValue={setValue} />}
      stake_tcy={() => <StakeTCYSpecific setValue={setValue} />}
      bond={() => null}
      unbond={() => null}
      leave={() => null}
      custom={() => null}
      vote={() => null}
      stake={() => null}
      unstake={() => null}
    />
  )
}
