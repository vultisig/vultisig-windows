import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'

import { CosmosSignDataReview } from './getCosmosSignDataReview'

/** Totals the chain's fee coin across every transfer of the signed data. */
export const getCosmosSignDataNativeAmount = ({
  chain,
  transfers,
}: CosmosSignDataReview) =>
  transfers
    .filter(({ coin }) => coin.denom === cosmosFeeCoinDenom[chain])
    .reduce((sum, { coin }) => sum + coin.amount, 0n)
