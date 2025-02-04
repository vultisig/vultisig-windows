import { storage } from '../../../wailsjs/go/models';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { AccountCoinKey, accountCoinKeyToString } from '../AccountCoin';
import { getCoinMetaKey } from './coinMeta';

type CoinToStorageCoinInput = Coin & {
  address: string;
};

export const getCoinKey = ({
  ticker,
  contractAddress,
  isNativeToken,
  chain,
  address,
}: Coin): AccountCoinKey => ({
  ...getCoinMetaKey({
    ticker,
    contractAddress,
    isNativeToken,
    chain: chain as Chain,
  }),
  address,
});

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
