import { callPopup } from '@core/inpage-provider/popup'
import {
  Eip712V4Payload,
  isEip712V4Payload,
} from '@core/inpage-provider/popup/interface'

import { getChain, processSignature } from '../utils'

export const signEthTypedDataV4 = async ([account, input]: [
  string,
  string | Eip712V4Payload,
]): Promise<string> => {
  const chain = await getChain()

  const parsed = typeof input === 'string' ? JSON.parse(input) : input
  if (!isEip712V4Payload(parsed)) {
    throw new Error('Invalid eth_signTypedData_v4 payload')
  }

  const result = await callPopup(
    {
      signMessage: {
        eth_signTypedData_v4: {
          chain,
          message: parsed,
        },
      },
    },
    {
      account,
    }
  )

  return processSignature(result)
}
