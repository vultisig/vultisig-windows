import axios from "axios";
import { TransactionResponse } from "ethers";

import { toCamelCase, toSnakeCase } from "./functions";
import { ChainKey, Currency } from "./constants";
import {
  CosmosAccountData,
  CosmosAccountDataResponse,
  FastSignInput,
  MayaAccountDataResponse,
  SignatureProps,
  ThorchainAccountDataResponse,
} from "./interfaces";
import { ThornodeTxResponse, ThornodeTxResponseSuccess, ThornodeNetworkResponse } from '../types/thorchain';

namespace CryptoCurrency {
  export interface Props {
    data: {
      [id: string]: {
        quote: {
          [currency: string]: {
            price: number;
          };
        };
      };
    };
  }
}

namespace Derivation {
  export interface Params {
    publicKeyEcdsa: string;
    hexChainCode: string;
    derivePath: string;
  }

  export interface Props {
    publicKey: string;
  }
}

const api = axios.create({
  headers: { accept: "application/json" },
  timeout: 10000,
});

const apiRef = {
  fourByte: "https://www.4byte.directory/",
  mayaChain: "https://mayanode.mayachain.info/",
  nineRealms: {
    rpc: "https://rpc.nineRealms.com/",
    thornode: "https://thornode.nineRealms.com/",
  },
  vultisig: {
    airdrop: "https://airdrop.vultisig.com/",
    api: "https://api.vultisig.com/",
  },
};

api.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error.response);
  }
);

api.interceptors.response.use((response) => {
  response.data = toCamelCase(response.data);

  return response;
});

export default {
  cryptoCurrency: (cmcId: number, currency: Currency): Promise<number> => {
    return new Promise((resolve) => {
      api
        .get<CryptoCurrency.Props>(
          `${apiRef.vultisig.api}cmc/v2/cryptocurrency/quotes/latest?id=${cmcId}&aux=platform&convert=${currency}`
        )
        .then(({ data }) => {
          if (
            data?.data &&
            data.data[cmcId]?.quote &&
            data.data[cmcId].quote[currency]?.price
          ) {
            resolve(data.data[cmcId].quote[currency].price);
          } else {
            resolve(0);
          }
        })
        .catch(() => resolve(0));
    });
  },
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      `${apiRef.vultisig.airdrop}api/derive-public-key`,
      toSnakeCase(params)
    );
  },
  getFunctionSelector: async (hexFunction: string) => {
    return new Promise<string>((resolve, reject) => {
      api
        .get<{ results: { textSignature: string }[] }>(
          `${apiRef.fourByte}api/v1/signatures/?format=json&hex_signature=${hexFunction}&ordering=created_at`
        )
        .then(({ data }) => {
          if (data.results?.length) {
            const [result] = data.results;

            resolve(result.textSignature);
          } else {
            throw new Error("");
          }
        })
        .catch(() => reject("Error getting FunctionSelector Text"));
    });
  },
  getIsFunctionSelector: async (hexFunction: string) => {
    return new Promise<boolean>((resolve) => {
      api
        .get<{ count: number }>(
          `${apiRef.fourByte}api/v1/signatures/?format=json&hex_signature=${hexFunction}&ordering=created_at`
        )
        .then(({ data }) => resolve(data.count > 0))
        .catch(() => resolve(false));
    });
  },
  getTransactionByHash(path: string, hash: string): Promise<string> {
    return new Promise((resolve, reject) => {
      api
        .get<{ tx: string }>(`${path}/${hash}`)
        .then(({ data }) => resolve(data.tx))
        .catch(reject);
    });
  },
  rpc: {
    post: (url: string, body: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        api
          .post(url, body)
          .then((response) => {
            resolve(response.data);
          })
          .catch(reject);
      });
    },
  },
  fastVault: {
    assertVaultExist: (ecdsa: string): Promise<boolean> => {
      return new Promise((resolve) => {
        api
          .get(`${apiRef.vultisig.api}vault/exist/${ecdsa}`)
          .then(() => resolve(true))
          .catch(() => resolve(false));
      });
    },
    signWithServer: async (input: FastSignInput) => {
      return new Promise((resolve, reject) => {
        const url = `${apiRef.vultisig.api}vault/sign`;
        api.post(url, input).then(resolve).catch(reject);
      });
    },
  },
  cosmos: {
    getAccountData(url: string): Promise<CosmosAccountData> {
      return new Promise((resolve, reject) => {
        api
          .get<CosmosAccountDataResponse>(url)
          .then(({ data }) => {
            if (data.account) resolve(data.account);
            else throw new Error("Account not found");
          })
          .catch(reject);
      });
    },
  },
  ethereum: {
    async getTransactionByHash(path: string, hash: string): Promise<TransactionResponse> {
      return await api
        .post<{ result: TransactionResponse }>(path, {
          id: 1,
          jsonrpc: "2.0",
          method: "eth_getTransactionByHash",
          params: [hash],
        })
        .then(({ data }) => data.result);
    },
  },
  maya: {
    fetchAccountNumber: async (address: string) => {
      return new Promise<MayaAccountDataResponse>((resolve, reject) => {
        api
          .get<{ result: { value: MayaAccountDataResponse } }>(
            `${apiRef.mayaChain}auth/accounts/${address}`
          )
          .then(({ data }) => resolve(data.result.value))
          .catch(reject);
      });
    },
  },
  thorchain: {
    fetchAccountNumber: async (address: string) => {
      return new Promise<ThorchainAccountDataResponse>((resolve, reject) => {
        api
          .get<{ result: { value: ThorchainAccountDataResponse } }>(
            `${apiRef.nineRealms.thornode}auth/accounts/${address}`,
            { headers: { "X-Client-ID": "vultisig" } }
          )
          .then(({ data }) => resolve(data.result.value))
          .catch(reject);
      });
    },
    getFeeData(): Promise<string> {
      return new Promise((resolve, reject) => {
        const url = `${apiRef.nineRealms.thornode}thorchain/network`;
        api
          .get<ThornodeNetworkResponse>(url)
          .then(({ data }) => resolve(data.native_tx_fee_rune))
          .catch(reject);
      });
    },
    getTHORChainChainID(): Promise<string> {
      return new Promise((resolve, reject) => {
        api
          .get<{ result: { node_info: { network: string } } }>(
            `${apiRef.nineRealms.rpc}status`
          )
          .then(({ data }) => resolve(data.result.node_info.network))
          .catch(reject);
      });
    },
    getTransactionByHash(hash: string): Promise<ThornodeTxResponseSuccess> {
      return new Promise((resolve, reject) => {
        api
          .get<ThornodeTxResponse>(`${apiRef.nineRealms.thornode}thorchain/tx/${hash}`)
          .then(({ data }) => {
            if ('code' in data) {
              throw new Error(data.message);
            }
            resolve(data)
          })
          .catch(reject);
      });
    },
  },
  transaction: {
    getComplete: async (uuid: string, message?: string) => {
      return new Promise((resolve, reject) => {
        api
          .get<SignatureProps>(
            `${apiRef.vultisig.api}router/complete/${uuid}/keysign`,
            { headers: { message_id: message ?? "" } }
          )
          .then(({ data, status }) => {
            if (status === 200) {
              const transformed = Object.entries(data).reduce(
                (acc, [key, value]) => {
                  const newKey = key.charAt(0).toUpperCase() + key.slice(1);
                  acc[newKey] = value;
                  return acc;
                },
                {} as { [key: string]: any }
              );

              resolve(transformed);
            }
          })
          .catch(reject);
      });
    },
    getDevices: async (uuid: string) => {
      return await api.get<string[]>(`${apiRef.vultisig.api}router/${uuid}`);
    },
    setStart: async (uuid: string, devices: string[]) => {
      return await api.post(
        `${apiRef.vultisig.api}router/start/${uuid}`,
        devices
      );
    },
  },
  utxo: {
    blockchairDashboard: (address: string, coinName: string) => {
      if (coinName === ChainKey.BITCOINCASH) coinName = "bitcoin-cash";

      return new Promise((resolve, reject) => {
        api
          .get<{ data: string }>(
            `${
              apiRef.vultisig.api
            }/blockchair/${coinName.toLowerCase()}/dashboards/address/${address}?state=latest`
          )
          .then(({ data }) => resolve(data.data))
          .catch(reject);
      });
    },
    blockchairGetTx: (chainName: string, txHash: string) => {
      if (chainName === ChainKey.BITCOINCASH) chainName = "bitcoin-cash";

      return new Promise((resolve, reject) => {
        const url = `${
          apiRef.vultisig.api
        }/blockchair/${chainName.toLowerCase()}/dashboards/transaction/${txHash}`;

        api
          .get(url)
          .then(({ data }) => {
            resolve(data.data[txHash]);
          })
          .catch(reject);
      });
    },
    blockchairStats: (chainName: string) => {
      if (chainName === ChainKey.BITCOINCASH) chainName = "bitcoin-cash";

      return new Promise((resolve, reject) => {
        api
          .get<{ data: string }>(
            `${apiRef.vultisig.api}/blockchair/${chainName.toLowerCase()}/stats`
          )
          .then(({ data }) => resolve(data.data))
          .catch(reject);
      });
    },
  },
};
