import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { SpecificSolana } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { ITokenService } from '../../Tokens/ITokenService';
import { IRpcService } from '../IRpcService';

const rpcURL = Endpoint.solanaServiceRpc;
const rpcURL2 = Endpoint.solanaServiceRpc;
const tokenInfoServiceURL = Endpoint.solanaTokenInfoServiceRpc;

export class RpcServiceSolana implements IRpcService, ITokenService {
  async sendTransaction(encodedTransaction: string): Promise<string> {
    try {
      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [encodedTransaction],
      };

      const post = await fetch(rpcURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await post.json();

      if (response.error) {
        console.error(`Error sending transaction: ${response.error.message}`);
      }

      return response.result as string;
    } catch (error) {
      console.error(`Error sending transaction: ${(error as any).message}`);
      return '';
    }
  }

  async getBalance(coin: Coin): Promise<string> {
    if (coin.isNativeToken) {
      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [coin.address],
      };

      const response = await this.postRequest(rpcURL, requestBody);
      return response.result?.value?.toString() || '0';
    } else {
      const tokenBalance = await this.fetchTokenBalance(
        coin.contractAddress,
        coin.address
      );
      return tokenBalance?.toString() || '0';
    }
  }

  async broadcastTransaction(hex: string): Promise<string> {
    // Solana does not broadcast via hex in the same way EVM chains do. Instead, you broadcast an encoded transaction.
    return this.sendTransaction(hex);
  }

  private async fetchRecentBlockhash(): Promise<string> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'finalized' }],
    };

    const response = await this.postRequest(rpcURL, requestBody);
    return response.result?.value?.blockhash as string;
  }

  async fetchTokenBalance(
    contractAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    try {
      const accounts: any[] =
        await this.fetchTokenAccountsByOwner(walletAddress);
      const tokenAccount = accounts.find(
        account => account.account.data.parsed.info.mint === contractAddress
      );
      const tokenAmount =
        tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.amount;
      return BigInt(tokenAmount ?? 0);
    } catch (error) {
      console.error(`Error fetching token balance: ${(error as any).message}`);
      return BigInt(0);
    }
  }

  async fetchTokenAssociatedAccountByOwner(
    walletAddress: string,
    mintAddress: string
  ): Promise<string> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { mint: mintAddress },
        { encoding: 'jsonParsed' },
      ],
    };

    const response = await this.postRequest(rpcURL2, requestBody);
    const accounts = response.result?.value || [];
    return accounts.length > 0 ? accounts[0].pubkey : '';
  }

  async fetchTokenAccountsByOwner(walletAddress: string): Promise<any[]> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed' },
      ],
    };

    const response = await this.postRequest(rpcURL2, requestBody);
    return response.result?.value || [];
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    // Fetch token accounts associated with the native token's address
    const accounts = await this.fetchTokenAccountsByOwner(nativeToken.address);

    // Extract token mint addresses from the accounts
    const tokenAddresses = accounts.map(
      account => account.account.data.parsed.info.mint
    );

    // Fetch token information for the given token addresses
    const tokenInfos = await this.fetchSolanaTokenInfoList(tokenAddresses);

    // Map the token information to CoinMeta objects
    return Object.entries(tokenInfos).map(([address, tokenInfo]: any) => ({
      chain: Chain.Solana, // Assuming Solana chain here, adjust if dynamic
      ticker: tokenInfo.tokenMetadata.onChainInfo.symbol,
      logo: tokenInfo.tokenList.image,
      decimals: tokenInfo.decimals,
      contractAddress: address,
      isNativeToken: false, // Non-native tokens in this case
      priceProviderId: tokenInfo.tokenList.extensions.coingeckoId ?? '',
    }));
  }

  private async fetchSolanaTokenInfoList(
    contractAddresses: string[]
  ): Promise<Record<string, any>> {
    const requestBody = { tokens: contractAddresses };
    const response = await this.postRequest(tokenInfoServiceURL, requestBody);
    return response;
  }

  private async fetchHighPriorityFee(account: string): Promise<number> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getRecentPrioritizationFees',
      params: [[account]],
    };

    const response = await this.postRequest(rpcURL, requestBody);
    const fees = response.result.map((feeObj: any) => feeObj.prioritizationFee);
    return Math.max(...fees.filter((fee: number) => fee > 0), 0);
  }

  async getSpecificTransactionInfo(coin: Coin): Promise<SpecificSolana> {
    try {
      // Fetch the recent block hash and priority fee concurrently
      const [recentBlockHash, highPriorityFee] = await Promise.all([
        this.fetchRecentBlockhash(),
        this.fetchHighPriorityFee(coin.address),
      ]);

      if (!recentBlockHash) {
        throw new Error('Failed to get recent block hash');
      }

      let fromAddressPubKey = coin.address;
      let toAddressPubKey = coin.contractAddress;

      // If the coin is not a native token and both from and to addresses are available
      if (fromAddressPubKey && toAddressPubKey && !coin.isNativeToken) {
        // Fetch associated token accounts for both the from and to addresses
        const [associatedTokenAddressFrom, associatedTokenAddressTo] =
          await Promise.all([
            this.fetchTokenAssociatedAccountByOwner(
              fromAddressPubKey,
              coin.contractAddress
            ),
            this.fetchTokenAssociatedAccountByOwner(
              toAddressPubKey,
              coin.contractAddress
            ),
          ]);

        fromAddressPubKey = associatedTokenAddressFrom;
        toAddressPubKey = associatedTokenAddressTo;
      }

      // Construct and return the SpecificSolana object
      return {
        recentBlockHash,
        priorityFee: highPriorityFee,
        fromAddressPubKey: fromAddressPubKey || undefined,
        toAddressPubKey: toAddressPubKey || undefined,
        gasPrice: 1000000 / Math.pow(10, 9),
        fee: 1000000, // Solana fees are handled differently
      } as SpecificSolana;
    } catch (error) {
      throw new Error(`Error fetching gas info: ${(error as any).message}`);
    }
  }

  async calculateFee(coin?: Coin): Promise<number> {
    const highPriorityFee = await this.fetchHighPriorityFee(
      coin?.address || ''
    );
    return highPriorityFee;
  }

  private async postRequest(url: string, body: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Error with request: ${response.statusText}`);
    }

    return await response.json();
  }
}
