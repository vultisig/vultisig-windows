import { callPopup } from '@core/inpage-provider/popup'
import { getBytes, isHexString } from 'ethers'

import { getChain, processSignature } from '../utils'

export const personalSign = async ([rawMessage, account]: [
  string,
  string,
]): Promise<string> => {
  const chain = await getChain()

  const messageBytes = isHexString(rawMessage)
    ? getBytes(rawMessage)
    : new TextEncoder().encode(rawMessage)

  const signature = await callPopup(
    {
      signMessage: {
        personal_sign: {
          bytesCount: messageBytes.length,
          chain,
          message: rawMessage,
          type: 'default',
        },
      },
    },
    { account }
  )

  return processSignature(signature)
}
