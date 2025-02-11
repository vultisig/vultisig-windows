import {
  AccountCoinKey,
  accountCoinKeyToString,
} from '@core/chain/coin/AccountCoin';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';

import { storage } from '../../../wailsjs/go/models';
import { assertChainField } from '../../chain/utils/assertChainField';
import { chainFeeCoin } from '../chainFeeCoin';

type CoinToStorageCoinInput = Coin & {
  address: string;
};

export const getCoinKey = (coin: Coin): AccountCoinKey => {
  const { chain } = assertChainField(coin);
  const feeCoin = chainFeeCoin[chain];

  const id = feeCoin ? coin.contractAddress : coin.ticker;

  return {
    chain,
    id,
    address: coin.address,
  };
};

export const coinToStorageCoin = (
  input: CoinToStorageCoinInput
): storage.Coin => {
  const {
    chain,
    ticker,
    contractAddress,
    isNativeToken,
    address,
    logo,
    priceProviderId,
    decimals,
  } = input;

  const coinKey = getCoinKey(input);

  return {
    id: accountCoinKeyToString(coinKey),
    chain,
    address,
    hex_public_key: input.hexPublicKey,
    ticker,
    contract_address: contractAddress,
    is_native_token: isNativeToken,
    logo,
    price_provider_id: priceProviderId,
    decimals,
  };
};
