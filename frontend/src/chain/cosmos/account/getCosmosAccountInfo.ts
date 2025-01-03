import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import { match } from '../../../lib/utils/match';
import { Chain, CosmosChain } from '../../../model/chain';
import { ChainAccount } from '../../ChainAccount';

type AccountInfoValueResponse = {
  account_number: string;
  sequence: string;
};

type AccountInfo = {
  accountNumber: number;
  sequence: number;
};

type AccountInfoResponse =
  | {
      result: {
        value: AccountInfoValueResponse;
      };
    }
  | {
      account: AccountInfoValueResponse;
    };

export const getCosmosAccountInfo = async ({
  address,
  chain,
}: ChainAccount<CosmosChain>): Promise<AccountInfo> => {
  const url = match(chain, {
    [Chain.Cosmos]: () =>
      `https://cosmos-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`,
    [Chain.Osmosis]: () =>
      `https://osmosis-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`,
    [Chain.MayaChain]: () =>
      `https://thornode.ninerealms.com/auth/accounts/${address}`,
    [Chain.Dydx]: () =>
      `https://dydx-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`,
    [Chain.Kujira]: () =>
      `https://kujira-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`,
    [Chain.Terra]: () =>
      `https://terra-lcd.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`,
    [Chain.TerraClassic]: () =>
      `https://terra-classic-lcd.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`,
    [Chain.Noble]: () =>
      `https://noble-api.polkachu.com/cosmos/auth/v1beta1/accounts/${address}`,
    [Chain.THORChain]: () =>
      `https://thornode.ninerealms.com/auth/accounts/${address}`,
  });

  const response = await Fetch(url);

  const data = (await response.json()) as AccountInfoResponse;

  const { account_number, sequence } =
    'account' in data ? data.account : data.result.value;

  return {
    accountNumber: Number(account_number),
    sequence: Number(sequence),
  };
};
