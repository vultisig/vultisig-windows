import {
  ThornodeTxResponse,
  ThornodeTxResponseSuccess,
} from '@clients/extension/src/types/thorchain'
import { toCamelCase } from '@clients/extension/src/utils/functions'
import { Chain } from '@core/chain/Chain'
import axios from 'axios'

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
