import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { coinKeyToString } from '../Coin';
import { getCoinMetaKey } from './coinMeta';

type CoinToStorageCoinInput = Coin & {
  address: string;
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

  const coinKey = getCoinMetaKey({
    ...input,
    chain: chain as Chain,
  });

  return {
    id: coinKeyToString(coinKey),
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
