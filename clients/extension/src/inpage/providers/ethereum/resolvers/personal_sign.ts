import { callPopup } from '@core/inpage-provider/popup'
import { getBytes, isHexString } from 'ethers'

import { EthereumResolver } from '../resolver'
import { getChain, processSignature } from '../utils'

export const personalSign: EthereumResolver<[string, string], string> = async ([
  rawMessage,
  account,
]) => {
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
