import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import { Chain, CosmosChain } from '../../../model/chain';
import { ChainAccount } from '../../ChainAccount';
import { cosmosRpcUrl } from '../cosmosRpcUrl';

type AccountInfoValueResponse = {
  account_number: string;
  sequence: string;
};

type AccountInfo = {
  accountNumber: number;
  sequence: number;
};

const getBetaAuthAccountInfo = async ({
  address,
  chain,
}: ChainAccount<CosmosChain>) => {
  const baseUrl = cosmosRpcUrl[chain];
  const url = `${baseUrl}/cosmos/auth/v1beta1/accounts/${address}`;
  const response = (await Fetch(url)) as {
    account: AccountInfoValueResponse;
  };

  return response.account;
};

const getAuthAccountInfo = async ({
  address,
  chain,
}: ChainAccount<CosmosChain>) => {
  const baseUrl = cosmosRpcUrl[chain];
  const url = `${baseUrl}/auth/accounts/${address}`;
  const response = (await Fetch(url)) as {
    result: {
      value: AccountInfoValueResponse;
    };
  };

  return response.result.value;
};

const accountInfoHandler: Record<
  CosmosChain,
  ({
    address,
    chain,
  }: ChainAccount<CosmosChain>) => Promise<AccountInfoValueResponse>
> = {
  [Chain.Cosmos]: getBetaAuthAccountInfo,
  [Chain.Osmosis]: getBetaAuthAccountInfo,
  [Chain.Dydx]: getBetaAuthAccountInfo,
  [Chain.Kujira]: getBetaAuthAccountInfo,
  [Chain.Terra]: getBetaAuthAccountInfo,
  [Chain.TerraClassic]: getBetaAuthAccountInfo,
  [Chain.Noble]: getBetaAuthAccountInfo,
  [Chain.THORChain]: getAuthAccountInfo,
  [Chain.MayaChain]: getAuthAccountInfo,
  [Chain.Akash]: getAuthAccountInfo,
};

export const getCosmosAccountInfo = async (
  account: ChainAccount<CosmosChain>
): Promise<AccountInfo> => {
  const { account_number, sequence } =
    await accountInfoHandler[account.chain](account);

  return {
    accountNumber: Number(account_number),
    sequence: Number(sequence ?? 0),
  };
};
