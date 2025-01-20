import { ChainAccount } from '../../../chain/ChainAccount';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

const rpcURL = Endpoint.solanaServiceRpc;
const rpcURL2 = Endpoint.solanaServiceRpc;
const tokenInfoServiceURL = Endpoint.solanaTokenInfoServiceRpc;

export class RpcServiceSolana implements IRpcService {
  async broadcastTransaction(encodedTransaction: string): Promise<string> {
    // Simulate transaction before sending
    const isSimulationSuccessful =
      await this.simulateTransaction(encodedTransaction);
    if (!isSimulationSuccessful.success) {
      console.error(isSimulationSuccessful.error);
      return (
        isSimulationSuccessful.error || 'Error to simulate the transaction'
      );
    }

    // Send transaction
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'sendTransaction',
      params: [
        encodedTransaction,
        {
          preflightCommitment: 'confirmed',
          skipPreflight: true,
        },
      ],
    };

    const post = await fetch(rpcURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const response = await post.json();

    if (response.error) {
      console.error(`Error sending transaction: ${response.error.message}`);
      return response.error.message;
    }

    const transactionHash = response.result as string;

    // Confirm transaction
    const isConfirmed = await this.confirmTransaction(transactionHash);
    if (!isConfirmed.success) {
      console.error(
        isConfirmed.error ||
          'Transaction confirmation failed or transaction was rejected.'
      );
      return (
        isConfirmed.error ||
        'Transaction confirmation failed or transaction was rejected.'
      );
    }

    return transactionHash;
  }

  async simulateTransaction(
    encodedTransaction: string
  ): Promise<{ success: boolean; error?: string }> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'simulateTransaction',
      params: [encodedTransaction],
    };

    try {
      const post = await fetch(rpcURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await post.json();

      if (response.error) {
        const errorMessage = `Simulation error: ${response.error.message}`;
        console.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (response.result.err) {
        const errorMessage = `Transaction simulation failed: ${JSON.stringify(response.result.err)}`;
        console.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = `Error simulating transaction: ${(error as any).message}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async confirmTransaction(
    transactionHash: string,
    timeout = 30000,
    interval = 2000
  ): Promise<{ success: boolean; error?: string; logs?: string[] }> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignatureStatuses',
      params: [[transactionHash], { searchTransactionHistory: true }],
    };

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const post = await fetch(rpcURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const response = await post.json();

        if (response.error) {
          const errorMessage = `Error fetching transaction status: ${response.error.message}`;
          console.error(errorMessage);
          return { success: false, error: errorMessage };
        }

        const status = response.result.value[0];

        const transactionDetails =
          await this.getTransactionDetails(transactionHash);

        if (status) {
          if (status.err) {
            // Fetch detailed logs if the transaction failed
            const errorMessage = `Transaction failed with error: ${JSON.stringify(status.err)}`;
            console.error(errorMessage);

            return {
              success: false,
              error: errorMessage,
              logs: transactionDetails.logs,
            };
          }

          return { success: true };
        }

        console.log('Waiting for transaction confirmation...');
      } catch (error) {
        const errorMessage = `Error confirming transaction: ${(error as any).message}`;
        console.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    const errorMessage = `Transaction confirmation timed out for hash: ${transactionHash}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }

  async getTransactionDetails(
    transactionHash: string
  ): Promise<{ logs?: string[]; error?: string }> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [transactionHash, { encoding: 'json' }],
    };

    try {
      const post = await fetch(rpcURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await post.json();

      if (response.error) {
        const errorMessage = `Error fetching transaction details: ${response.error.message}`;
        console.error(errorMessage);
        return { error: errorMessage };
      }

      const transactionDetails = response.result;
      return {
        logs: transactionDetails?.meta?.logMessages || [],
      };
    } catch (error) {
      const errorMessage = `Error fetching transaction details: ${(error as any).message}`;
      console.error(errorMessage);
      return { error: errorMessage };
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

  async fetchRecentBlockhash(): Promise<string> {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'confirmed' }], //Official Solana recommendation: Use confirmed commitment when fetching recent blockhash. This will provide a better (extended with aprox. 13s) time window as compared to finalized commitment, thus reducing the risk of transaction expiration (see below).
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

  async getTokens(account: ChainAccount): Promise<CoinMeta[]> {
    if (!account.address) {
      throw new Error('Invalid native token: Address is required');
    }

    const accounts = await this.fetchTokenAccountsByOwner(account.address);
    if (!accounts.length) {
      return [];
    }

    const tokenAddresses = accounts.map(
      account => account.account.data.parsed.info.mint
    );
    const tokenInfos = await this.fetchSolanaTokenInfoList(tokenAddresses);

    return Object.entries(tokenInfos)
      .filter(([_, info = {}]) =>
        this.isValidToken({
          coingeckoId: info.tokenList?.extensions?.coingeckoId,
          symbol: info.tokenList?.symbol,
          decimals: info.decimals,
        })
      )
      .map(([address, info]) => this.mapToCoinMeta(address, info));
  }

  private async fetchSolanaTokenInfoList(
    contractAddresses: string[]
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const missingTokens: string[] = [];

    try {
      const solanaFmResults = await this.postRequest(tokenInfoServiceURL, {
        tokens: contractAddresses,
      });

      Object.assign(results, solanaFmResults);

      missingTokens.push(...contractAddresses.filter(addr => !results[addr]));

      if (missingTokens.length) {
        console.warn(
          `Missing tokens from Solana.fm: ${missingTokens.join(', ')}`
        );

        const fallbackResults = await this.fetchFromJupiterBatch(missingTokens);

        fallbackResults.forEach(({ address, data }) => {
          if (data) results[address] = data;
        });
      }
    } catch (error) {
      console.error(`Error fetching token info: ${error}`);
    }

    return results;
  }

  private async fetchFromJupiterBatch(
    contractAddresses: string[]
  ): Promise<{ address: string; data: any }[]> {
    const fetchPromises = contractAddresses.map(address =>
      this.fetchFromJupiter(address)
        .then(data => ({ address, data }))
        .catch(error => {
          console.error(
            `Error fetching token ${address} from Jupiter API: ${error.message}`
          );
          return { address, data: null };
        })
    );

    return Promise.all(fetchPromises);
  }

  private async fetchFromJupiter(contractAddress: string): Promise<any> {
    const url = Endpoint.solanaTokenInfoJupiterServiceRpc(contractAddress);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  }

  private isValidToken(tokenInfo: {
    coingeckoId?: string;
    symbol?: string;
    decimals?: number;
  }): boolean {
    if (!tokenInfo?.symbol || !tokenInfo?.decimals || !tokenInfo?.coingeckoId) {
      console.warn(
        `Skipping token with incomplete metadata: ${JSON.stringify(tokenInfo)}`
      );
      return false;
    }
    return true;
  }

  private mapToCoinMeta(address: string, tokenInfo: any): CoinMeta {
    return {
      chain: Chain.Solana,
      ticker: (tokenInfo.tokenList?.symbol || '').toUpperCase(),
      logo: tokenInfo.tokenList?.image || '',
      decimals: tokenInfo.decimals || 0,
      contractAddress: address,
      isNativeToken: false,
      priceProviderId: tokenInfo.tokenList?.extensions?.coingeckoId || '',
    };
  }

  async fetchHighPriorityFee(account: string): Promise<number> {
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
