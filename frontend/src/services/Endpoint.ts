import { Chain } from '../model/chain';

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

  // static fetchSwapQuoteThorchain(chain: SwapChain, address: string, fromAsset: string, toAsset: string, amount: string, interval: string, isAffiliate: boolean): URL {
  //     const isAffiliateParams = isAffiliate
  //         ? `&affiliate=${THORChainSwaps.affiliateFeeAddress}&affiliate_bps=${THORChainSwaps.affiliateFeeRateBp}`
  //         : "";
  //     return new URL(`${chain.baseUrl}/quote/swap?from_asset=${fromAsset}&to_asset=${toAsset}&amount=${amount}&destination=${address}&streaming_interval=${interval}${isAffiliateParams}`);
  // }

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

  static bscServiceRpcService: string = 'https://bsc-rpc.publicnode.com';

  static baseServiceRpcService: string = 'https://base-rpc.publicnode.com';

  static arbitrumOneServiceRpcService: string =
    'https://arbitrum-one-rpc.publicnode.com';

  static polygonServiceRpcService: string =
    'https://polygon-bor-rpc.publicnode.com';

  static optimismServiceRpcService: string =
    'https://optimism-rpc.publicnode.com';

  static cronosServiceRpcService: string =
    'https://cronos-evm-rpc.publicnode.com';

  static blastServiceRpcService: string = 'https://rpc.ankr.com/blast';

  static zksyncServiceRpcService: string = 'https://mainnet.era.zksync.io';

  static ethServiceRpcService: string = 'https://ethereum-rpc.publicnode.com';

  static solanaServiceRpc: string = 'https://api.mainnet-beta.solana.com';

  static solanaServiceRpc2: string = 'https://solana-rpc.publicnode.com';

  static solanaTokenInfoServiceRpc: string = 'https://api.solana.fm/v1/tokens';

  static suiServiceRpc: string = 'https://sui-rpc.publicnode.com';

  static polkadotServiceRpc: string = 'https://polkadot-rpc.publicnode.com';

  static polkadotServiceBalance: string =
    'https://polkadot.api.subscan.io/api/v2/scan/search';

  static tonServiceRpc: string = 'https://toncenter.com/api/v2/jsonRPC';

  static fetchTonBalance(address: string): string {
    return `https://toncenter.com/api/v3/addressInformation?address=${address}&use_v2=false`;
  }

  static bitcoinLabelTxHash(value: string): string {
    return `https://mempool.space/tx/${value}`;
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

  static ethereumLabelTxHash(value: string): string {
    return `https://etherscan.io/tx/${value}`;
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

  static fetchBitcoinTransactions(userAddress: string): string {
    return `https://mempool.space/api/address/${userAddress}/txs`;
  }

  static fetchLitecoinTransactions(userAddress: string): string {
    return `https://litecoinspace.org/api/address/${userAddress}/txs`;
  }

  static bscLabelTxHash(value: string): string {
    return `https://bscscan.com/tx/${value}`;
  }

  static fetchCosmosAccountBalance(address: string): string {
    return `https://cosmos-rest.publicnode.com/cosmos/bank/v1beta1/balances/${address}`;
  }

  static fetchCosmosAccountNumber(address: string): string {
    return `https://cosmos-rest.publicnode.com/cosmos/auth/v1beta1/accounts/${address}`;
  }

  static broadcastCosmosTransaction: string =
    'https://cosmos-rest.publicnode.com/cosmos/tx/v1beta1/txs';

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

  static getSwapProgressURL(txid: string): string {
    return `https://runescan.io/tx/${txid.stripHexPrefix()}`;
  }

  static getMayaSwapTracker(txid: string): string {
    return `https://www.mayascan.org/tx/${txid.stripHexPrefix()}`;
  }

  static getExplorerURL(chainTicker: string, txid: string): string {
    switch (chainTicker) {
      case 'BTC':
        return `https://blockchair.com/bitcoin/transaction/${txid}`;
      case 'BCH':
        return `https://blockchair.com/bitcoin-cash/transaction/${txid}`;
      case 'LTC':
        return `https://blockchair.com/litecoin/transaction/${txid}`;
      case 'DOGE':
        return `https://blockchair.com/dogecoin/transaction/${txid}`;
      case 'DASH':
        return `https://blockchair.com/dash/transaction/${txid}`;
      case 'RUNE':
        return `https://runescan.io/tx/${txid.stripHexPrefix()}`;
      case 'SOL':
        return `https://explorer.solana.com/tx/${txid}`;
      case 'ETH':
        return `https://etherscan.io/tx/${txid}`;
      case 'UATOM':
        return `https://www.mintscan.io/cosmos/tx/${txid}`;
      case 'ADYDX':
        return `https://www.mintscan.io/dydx/tx/${txid}`;
      case 'UKUJI':
        return `https://finder.kujira.network/kaiyo-1/tx/${txid}`;
      case 'AVAX':
        return `https://snowtrace.io/tx/${txid}`;
      case 'BNB':
        return `https://bscscan.com/tx/${txid}`;
      case 'CACAO':
        return `https://www.mayascan.org/tx/${txid}`;
      case 'ARB':
        return `https://arbiscan.io/tx/${txid}`;
      case 'BASE':
        return `https://basescan.org/tx/${txid}`;
      case 'OP':
        return `https://optimistic.etherscan.io/tx/${txid}`;
      case 'MATIC':
        return `https://polygonscan.com/tx/${txid}`;
      case 'BLAST':
        return `https://blastscan.io/tx/${txid}`;
      case 'CRO':
        return `https://cronoscan.com/tx/${txid}`;
      case 'SUI':
        return `https://suiscan.xyz/mainnet/tx/${txid}`;
      case 'DOT':
        return `https://polkadot.subscan.io/extrinsic/${txid}`;
      case 'ZK':
        return `https://explorer.zksync.io/tx/${txid}`;
      default:
        return '';
    }
  }

  static getExplorerByAddressURLByGroup(
    chain: Chain | null,
    address: string
  ): string | null {
    switch (chain) {
      case Chain.THORChain:
        return `https://runescan.io/address/${address}`;
      case Chain.Solana:
        return `https://explorer.solana.com/address/${address}`;
      case Chain.Ethereum:
        return `https://etherscan.io/address/${address}`;
      case Chain.Cosmos:
        return `https://www.mintscan.io/cosmos/address/${address}`;
      case Chain.Dydx:
        return `https://www.mintscan.io/dydx/address/${address}`;
      case Chain.Kujira:
        return `https://finder.kujira.network/kaiyo-1/address/${address}`;
      case Chain.Avalanche:
        return `https://snowtrace.io/address/${address}`;
      case Chain.BSC:
        return `https://bscscan.com/address/${address}`;
      case Chain.Bitcoin:
        return `https://www.blockchain.com/btc/address/${address}`;
      case Chain.BitcoinCash:
        return `https://explorer.bitcoin.com/bch/address/${address}`;
      case Chain.Litecoin:
        return `https://blockchair.com/litecoin/address/${address}`;
      case Chain.Dogecoin:
        return `https://blockchair.com/dogecoin/address/${address}`;
      case Chain.Dash:
        return `https://blockchair.com/dash/address/${address}`;
      case Chain.MayaChain:
        return `https://www.mayascan.org/address/${address}`;
      case Chain.Arbitrum:
        return `https://arbiscan.io/address/${address}`;
      case Chain.Base:
        return `https://basescan.org/address/${address}`;
      case Chain.Optimism:
        return `https://optimistic.etherscan.io/address/${address}`;
      case Chain.Polygon:
        return `https://polygonscan.com/address/${address}`;
      case Chain.Blast:
        return `https://blastscan.io/address/${address}`;
      case Chain.CronosChain:
        return `https://cronoscan.com/address/${address}`;
      case Chain.Sui:
        return `https://suiscan.xyz/mainnet/address/${address}`;
      case Chain.Polkadot:
        return `https://polkadot.subscan.io/account/${address}`;
      case Chain.Zksync:
        return `https://explorer.zksync.io/address/${address}`;
      default:
        return null;
    }
  }
}
