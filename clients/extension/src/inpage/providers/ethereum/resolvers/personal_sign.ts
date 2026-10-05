import { callPopup } from '@core/inpage-provider/popup'

import { getChain, processSignature } from '../utils'

export const personalSign = async ([rawMessage, account]: [
  string,
  string,
]): Promise<string> => {
  const chain = await getChain(account)

  const signature = await callPopup(
    {
      signMessage: {
        personal_sign: {
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
