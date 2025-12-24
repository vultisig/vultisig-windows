import { callPopup } from '@core/inpage-provider/popup'
import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'

import { getChain, processSignature } from '../utils'

export const signEthTypedDataV4 = async ([account, input]: [
  string,
  string | Eip712V4Payload,
]): Promise<string> => {
  const chain = await getChain()

  const result = await callPopup(
    {
      signMessage: {
        eth_signTypedData_v4: {
          chain,
          message:
            typeof input === 'string'
              ? (JSON.parse(input) as Eip712V4Payload)
              : input,
        },
      },
    },
    {
      account,
    }
  )

  return processSignature(result)
}
