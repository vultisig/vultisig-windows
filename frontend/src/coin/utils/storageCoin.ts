import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { AccountCoinKey } from '../AccountCoin';

export const getStorageCoinKey = ({
  ticker,
  contract_address,
  is_native_token,
  chain,
  address,
}: storage.Coin): AccountCoinKey => {
  return {
    chainId: chain as Chain,
    id: is_native_token ? ticker : contract_address,
    address,
  };
};

export const storageCoinToCoin = (storageCoin: storage.Coin): Coin => {
  const {
    chain,
    address,
    hex_public_key,
    ticker,
    contract_address,
    is_native_token,
    logo,
    price_provider_id,
    decimals,
  } = storageCoin;

  return new Coin({
    chain,
    ticker,
    address,
    contractAddress: contract_address,
    decimals,
    priceProviderId: price_provider_id,
    isNativeToken: is_native_token,
    hexPublicKey: hex_public_key,
    logo,
  });
};
