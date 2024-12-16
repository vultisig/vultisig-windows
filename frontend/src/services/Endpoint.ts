export class Endpoint {
  static VULTISIG_RELAY: string = 'https://api.vultisig.com/router';
  static LOCAL_MEDIATOR_URL: string = 'http://127.0.0.1:18080';
  static vultisigApiProxy: string = 'https://api.vultisig.com';
  static supportDocumentLink: string =
    'https://docs.vultisig.com/user-actions/creating-a-vault';
  static vultisigRelay: string = 'https://api.vultisig.com/router';
  static broadcastTransactionThorchainNineRealms: string =
    'https://thornode.ninerealms.com/cosmos/tx/v1beta1/txs';
  static broadcastTransactionMayachain: string =
    'https://mayanode.mayachain.info/cosmos/tx/v1beta1/txs';

  static fetchBlowfishTransactions(chain: string, network: string): string {
    return `${this.vultisigApiProxy}/blowfish/${chain}/v0/${network}/scan/transactions?language=en&method=eth_sendTransaction`;
  }

  static fetchBlowfishSolanaTransactions(): string {
    return `${this.vultisigApiProxy}/blowfish/solana/v0/mainnet/scan/transactions?language=en`;
  }

  static fetchAccountNumberThorchainNineRealms(address: string): string {
    return `https://thornode.ninerealms.com/auth/accounts/${address}`;
  }

  static fetchThorchainNetworkInfoNineRealms: string =
    'https://thornode.ninerealms.com/thorchain/network';
  static thorchainNetworkInfo: URL = new URL(
    'https://rpc.ninerealms.com/status'
  );

  static fetchAccountNumberMayachain(address: string): string {
    return `https://mayanode.mayachain.info/auth/accounts/${address}`;
  }

  static fetchAccountBalanceThorchainNineRealms(address: string): string {
    return `https://thornode.ninerealms.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchAccountBalanceMayachain(address: string): string {
    return `https://mayanode.mayachain.info/cosmos/bank/v1beta1/balances/${address}`;
  }

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

  static avalancheServiceRpcService: string =
    'https://avalanche-c-chain-rpc.publicnode.com';

  static bscServiceRpcService: string = 'https://api.vultisig.com/bsc/';

  static baseServiceRpcService: string = 'https://api.vultisig.com/base/';

  static arbitrumOneServiceRpcService: string = 'https://api.vultisig.com/arb/';

  static polygonServiceRpcService: string = 'https://api.vultisig.com/polygon/';

  static optimismServiceRpcService: string = 'https://api.vultisig.com/opt/';

  static cronosServiceRpcService: string =
    'https://cronos-evm-rpc.publicnode.com';

  static blastServiceRpcService: string = 'https://api.vultisig.com/blast/';

  static zksyncServiceRpcService: string = 'https://api.vultisig.com/zksync/';

  static ethServiceRpcService: string = 'https://api.vultisig.com/eth/';

  static solanaServiceRpc: string = 'https://api.vultisig.com/solana/';

  static solanaTokenInfoServiceRpc: string = 'https://api.solana.fm/v1/tokens';

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

  static blockchairStats(chainName: string): URL {
    return new URL(`${this.vultisigApiProxy}/blockchair/${chainName}/stats`);
  }

  static blockchairBroadcast(chainName: string): URL {
    return new URL(
      `${this.vultisigApiProxy}/blockchair/${chainName}/push/transaction`
    );
  }

  static blockchairDashboard(address: string, coinName: string): URL {
    return new URL(
      `${this.vultisigApiProxy}/blockchair/${coinName}/dashboards/address/${address}?state=latest`
    );
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

  static fetchCosmosAccountBalance(address: string): string {
    return `https://cosmos-rest.publicnode.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchCosmosAccountNumber(address: string): string {
    return `https://cosmos-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static broadcastCosmosTransaction: string =
    'https://cosmos-rest.publicnode.com/cosmos/tx/v1beta1/txs';

  static fetchTerraV2AccountBalance(address: string): string {
    return `https://terra-lcd.publicnode.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchTerraV2AccountNumber(address: string): string {
    return `https://terra-lcd.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static broadcastTerraV2Transaction: string =
    'https://terra-lcd.publicnode.com/cosmos/tx/v1beta1/txs';

  static fetchTerraClassicWasmTokenBalance(
    contractAddress: string,
    base64Payload: string
  ): string {
    return `https://terra-classic-lcd.publicnode.com/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${base64Payload}`;
  }

  static fetchTerraV2WasmTokenBalance(
    contractAddress: string,
    base64Payload: string
  ): string {
    return `https://terra-lcd.publicnode.com/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${base64Payload}`;
  }

  static fetchTerraClassicAccountBalance(address: string): string {
    return `https://terra-classic-lcd.publicnode.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchTerraClassicAccountNumber(address: string): string {
    return `https://terra-classic-lcd.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static broadcastTerraClassicTransaction: string =
    'https://terra-classic-lcd.publicnode.com/cosmos/tx/v1beta1/txs';

  static fetchOsmosisAccountBalance(address: string): string {
    return `https://osmosis-rest.publicnode.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchOsmosisAccountNumber(address: string): string {
    return `https://osmosis-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static broadcastOsmosisTransaction: string =
    'https://osmosis-rest.publicnode.com/cosmos/tx/v1beta1/txs';

  static broadcastNobleTransaction: string =
    'https://noble-api.polkachu.com/cosmos/tx/v1beta1/txs';

  static fetchNobleAccountNumber(address: string): string {
    return `https://noble-api.polkachu.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static fetchNobleAccountBalance(address: string): string {
    return `https://noble-api.polkachu.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchDydxAccountBalance(address: string): string {
    return `https://dydx-rest.publicnode.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchDydxAccountNumber(address: string): string {
    return `https://dydx-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static broadcastDydxTransaction: string =
    'https://dydx-rest.publicnode.com/cosmos/tx/v1beta1/txs';

  static fetchKujiraAccountBalance(address: string): string {
    return `https://kujira-rest.publicnode.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchKujiraAccountNumber(address: string): string {
    return `https://kujira-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static broadcastKujiraTransaction: string =
    'https://kujira-rest.publicnode.com/cosmos/tx/v1beta1/txs';
}
