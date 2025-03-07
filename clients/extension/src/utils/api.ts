import { tss } from '@clients/desktop/wailsjs/go/models'
import {
  ThornodeTxResponse,
  ThornodeTxResponseSuccess,
} from '@clients/extension/src/types/thorchain'
import {
  toCamelCase,
  toSnakeCase,
} from '@clients/extension/src/utils/functions'
import {
  FastSignInput,
  SignatureProps,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import axios from 'axios'
import { TransactionResponse } from 'ethers'

namespace Derivation {
  export interface Params {
    publicKeyEcdsa: string
    hexChainCode: string
    derivePath: string
  }

  export interface Props {
    publicKey: string
  }
}

const api = axios.create({
  headers: { accept: 'application/json' },
  timeout: 10000,
})

const apiRef = {
  fourByte: 'https://www.4byte.directory/',
  mayaChain: 'https://mayanode.mayachain.info/',
  nineRealms: {
    rpc: 'https://rpc.nineRealms.com/',
    thornode: 'https://thornode.nineRealms.com/',
  },
  vultisig: {
    airdrop: 'https://airdrop.vultisig.com/',
    api: 'https://api.vultisig.com/',
  },
}

api.interceptors.request.use(
  config => config,
  error => {
    return Promise.reject(error.response)
  }
)

api.interceptors.response.use(response => {
  response.data = toCamelCase(response.data)

  return response
})

export default {
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      `${apiRef.vultisig.airdrop}api/derive-public-key`,
      toSnakeCase(params)
    )
  },
  getFunctionSelector: async (hexFunction: string) => {
    return new Promise<string>((resolve, reject) => {
      api
        .get<{ results: { textSignature: string }[] }>(
          `${apiRef.fourByte}api/v1/signatures/?format=json&hex_signature=${hexFunction}&ordering=created_at`
        )
        .then(({ data }) => {
          if (data.results?.length) {
            const [result] = data.results

            resolve(result.textSignature)
          } else {
            throw new Error('')
          }
        })
        .catch(() => reject('Error getting FunctionSelector Text'))
    })
  },
  getIsFunctionSelector: async (hexFunction: string) => {
    return new Promise<boolean>(resolve => {
      api
        .get<{ count: number }>(
          `${apiRef.fourByte}api/v1/signatures/?format=json&hex_signature=${hexFunction}&ordering=created_at`
        )
        .then(({ data }) => resolve(data.count > 0))
        .catch(() => resolve(false))
    })
  },
  fastVault: {
    assertVaultExist: (ecdsa: string): Promise<boolean> => {
      return new Promise(resolve => {
        api
          .get(`${apiRef.vultisig.api}vault/exist/${ecdsa}`)
          .then(() => resolve(true))
          .catch(() => resolve(false))
      })
    },
    signWithServer: async (input: FastSignInput) => {
      return new Promise((resolve, reject) => {
        const url = `${apiRef.vultisig.api}vault/sign`
        api.post(url, input).then(resolve).catch(reject)
      })
    },
  },
  ethereum: {
    async getTransactionByHash(
      path: string,
      hash: string
    ): Promise<TransactionResponse> {
      return await api
        .post<{ result: TransactionResponse }>(path, {
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [hash],
        })
        .then(({ data }) => data.result)
    },
  },
  thorchain: {
    getTransactionByHash(hash: string): Promise<ThornodeTxResponseSuccess> {
      return new Promise((resolve, reject) => {
        api
          .get<ThornodeTxResponse>(
            `${apiRef.nineRealms.thornode}thorchain/tx/${hash}`
          )
          .then(({ data }) => {
            if ('code' in data) {
              throw new Error(data.message)
            }
            resolve(data)
          })
          .catch(reject)
      })
    },
  },
  transaction: {
    getComplete: async (
      uuid: string,
      message?: string
    ): Promise<tss.KeysignResponse> => {
      return new Promise((resolve, reject) => {
        api
          .get<SignatureProps>(
            `${apiRef.vultisig.api}router/complete/${uuid}/keysign`,
            { headers: { message_id: message ?? '' } }
          )
          .then(({ data, status }) => {
            if (status === 200) {
              const transformed = Object.entries(data).reduce(
                (acc, [key, value]) => {
                  const newKey = key.charAt(0).toUpperCase() + key.slice(1)
                  acc[newKey] = value
                  return acc
                },
                {} as { [key: string]: any }
              )
              const response: tss.KeysignResponse = {
                der_signature: transformed.DerSignature,
                msg: transformed.Msg,
                r: transformed.R,
                recovery_id: transformed.RecoveryID,
                s: transformed.S,
              }

              resolve(response)
            }
          })
          .catch(reject)
      })
    },
    getDevices: async (uuid: string) => {
      return await api.get<string[]>(`${apiRef.vultisig.api}router/${uuid}`)
    },
    setStart: async (uuid: string, devices: string[]) => {
      return await api.post(
        `${apiRef.vultisig.api}router/start/${uuid}`,
        devices
      )
    },
  },
  utxo: {
    blockchairGetTx: (chainName: string, txHash: string) => {
      if (chainName === Chain.BitcoinCash) chainName = 'bitcoin-cash'

      return new Promise((resolve, reject) => {
        const url = `${
          apiRef.vultisig.api
        }/blockchair/${chainName.toLowerCase()}/dashboards/transaction/${txHash}`

        api
          .get(url)
          .then(({ data }) => {
            resolve(data.data[txHash])
          })
          .catch(reject)
      })
    },
  },
}
