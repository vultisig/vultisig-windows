import { cosmosRpcUrl } from '../chain/cosmos/cosmosRpcUrl';
import { Chain, CosmosChain } from '../model/chain';

export class Endpoint {
  static VULTISIG_RELAY: string = 'https://api.vultisig.com/router';
  static LOCAL_MEDIATOR_URL: string = 'http://127.0.0.1:18080';
  static vultisigApiProxy: string = 'https://api.vultisig.com';
  static supportDocumentLink: string =
    'https://docs.vultisig.com/user-actions/creating-a-vault';
  static vultisigRelay: string = 'https://api.vultisig.com/router';

  static fetchBlowfishTransactions(chain: string, network: string): string {
    return `${this.vultisigApiProxy}/blowfish/${chain}/v0/${network}/scan/transactions?language=en&method=eth_sendTransaction`;
  }

  static fetchBlowfishSolanaTransactions(): string {
    return `${this.vultisigApiProxy}/blowfish/solana/v0/mainnet/scan/transactions?language=en`;
  }

  static fetchThorchainNetworkInfoNineRealms: string = `${cosmosRpcUrl[Chain.THORChain]}/thorchain/network`;
  static thorchainNetworkInfo: URL = new URL(
    'https://rpc.ninerealms.com/status'
  );

  static resolveTNS(name: string) {
    return `https://midgard.ninerealms.com/v2/thorname/lookup/${name}`;
  }

  static fetch1InchSwapQuote(
    chain: string,
    source: string,
    destination: string,
    amount: string,
    from: string,
    slippage: string,
    referrer: string,
    fee: number,
    isAffiliate: boolean
  ): URL {
    const isAffiliateParams = isAffiliate
      ? `&referrer=${referrer}&fee=${fee}`
      : '';
    return new URL(
      `${this.vultisigApiProxy}/1inch/swap/v6.0/${chain}/swap?src=${source}&dst=${destination}&amount=${amount}&from=${from}&slippage=${slippage}&disableEstimate=true&includeGas=true${isAffiliateParams}`
    );
  }

  static fetchLiFiQuote(
    fromChain: string,
    toChain: string,
    fromToken: string,
    toToken: string,
    fromAmount: string,
    fromAddress: string
  ): URL {
    return new URL(
      `https://li.quest/v1/quote?fromChain=${fromChain}&toChain=${toChain}&fromToken=${fromToken}&toToken=${toToken}&fromAmount=${fromAmount}&fromAddress=${fromAddress}`
    );
  }

  static fetchTokens(chain: number): string {
    return `${this.vultisigApiProxy}/1inch/swap/v6.0/${chain}/tokens`;
  }

  static fetch1InchsTokensBalance(chain: string, address: string): string {
    return `${this.vultisigApiProxy}/1inch/balance/v1.2/${chain}/balances/${address}`;
  }

  static fetch1InchsTokensInfo(chain: string, addresses: string[]): string {
    const joinedAddresses = addresses.join(',');
    return `${this.vultisigApiProxy}/1inch/token/v1.2/${chain}/custom?addresses=${joinedAddresses}`;
  }

  static fetchCoinPaprikaQuotes(quotes: string): string {
    return `https://api.coinpaprika.com/v1/tickers?quotes=${quotes}`;
  }

  static baseServiceRpcService: string = 'https://api.vultisig.com/base/';

  static cronosServiceRpcService: string =
    'https://cronos-evm-rpc.publicnode.com';

  static blastServiceRpcService: string = 'https://api.vultisig.com/blast/';

  static ethServiceRpcService: string = 'https://api.vultisig.com/eth/';

  static solanaServiceRpc: string = 'https://api.vultisig.com/solana/';

  static solanaTokenInfoServiceRpc: string = 'https://api.solana.fm/v1/tokens';

  static solanaTokenInfoJupiterServiceRpc = (contractAddress: string) =>
    `https://tokens.jup.ag/token/${contractAddress}`;

  static suiServiceRpc: string = 'https://sui-rpc.publicnode.com';

  static polkadotServiceRpc: string = 'https://polkadot-rpc.publicnode.com';

  static polkadotServiceBalance: string =
    'https://polkadot.api.subscan.io/api/v2/scan/search';

  static tonServiceRpc: string = 'https://api.vultisig.com/ton/v2/jsonRPC';

  static rippleServiceRpc = 'https://xrplcluster.com';

  static fetchTonBalance(address: string): string {
    return `https://api.vultisig.com/ton/v3/addressInformation?address=${address}&use_v2=false`;
  }

  static fetchExtendedAddressInformation(address: string): string {
    return `https://api.vultisig.com/ton/v2/getExtendedAddressInformation?address=${address}`;
  }

  static broadcastTonTransaction(): string {
    return `https://api.vultisig.com/ton/v2/sendBocReturnHash`;
  }

  static litecoinLabelTxHash(value: string): string {
    return `https://litecoinspace.org/tx/${value}`;
  }

  static fetchCryptoPrices(ids: string, currencies: string): URL {
    return new URL(
      `${this.vultisigApiProxy}/coingeicko/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`
    );
  }

  static fetchTokenPrice(
    network: string,
    addresses: string[],
    currencies: string
  ): URL {
    const joinedAddresses = addresses.join(',');
    return new URL(
      `${this.vultisigApiProxy}/coingeicko/api/v3/simple/token_price/${network.toLowerCase()}?contract_addresses=${joinedAddresses}&vs_currencies=${currencies}`
    );
  }

  static fetchTokensInfo(network: string, addresses: string[]): string {
    const joinedAddresses = addresses.join(',');
    return `${this.vultisigApiProxy}/coingeicko/api/v3/onchain/networks/${network}/tokens/multi/${joinedAddresses}`;
  }

  static fetchLitecoinTransactions(userAddress: string): string {
    return `https://litecoinspace.org/api/address/${userAddress}/txs`;
  }

  static fetchTerraClassicWasmTokenBalance(
    contractAddress: string,
    base64Payload: string
  ): string {
    return `${cosmosRpcUrl[CosmosChain.TerraClassic]}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${base64Payload}`;
  }

  static fetchTerraV2WasmTokenBalance(
    contractAddress: string,
    base64Payload: string
  ): string {
    return `${cosmosRpcUrl[CosmosChain.Terra]}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${base64Payload}`;
  }
}
