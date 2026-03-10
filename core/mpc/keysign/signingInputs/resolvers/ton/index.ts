import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { TW } from '@trustwallet/wallet-core'

import { getBlockchainSpecificValue } from '../../../chainSpecific/KeysignChainSpecific'
import { getKeysignTwPublicKey } from '../../../tw/getKeysignTwPublicKey'
import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { SigningInputsResolver } from '../../resolver'
import { buildJettonTransfer } from './jetton'
import {
  buildNativeTonTransfer,
  buildNativeTonTransferFromMessage,
} from './native'

export const getTonSigningInputs: SigningInputsResolver<'ton'> = ({
  keysignPayload,
  walletCore,
}) => {
  const coin = getKeysignCoin(keysignPayload)

  const {
    expireAt,
    sequenceNumber,
    bounceable,
    sendMaxAmount,
    jettonAddress,
    isActiveDestination,
  } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tonSpecific'
  )

  const isStakeOp =
    !!keysignPayload.memo && ['d', 'w'].includes(keysignPayload.memo.trim())

  const signTonMessages =
    keysignPayload.signData?.case === 'signTon'
      ? keysignPayload.signData.value.tonMessages
      : undefined

  const messages =
    signTonMessages && signTonMessages.length > 0 && isFeeCoin(coin)
      ? signTonMessages.map(msg =>
          buildNativeTonTransferFromMessage({
            to: msg.to,
            amount: msg.amount,
            payload: msg.payload,
            bounceable: isStakeOp ? true : !!bounceable,
          })
        )
      : [
          isFeeCoin(coin)
            ? buildNativeTonTransfer({
                keysignPayload,
                bounceable: isStakeOp ? true : !!bounceable,
                sendMaxAmount,
              })
            : buildJettonTransfer({
                keysignPayload,
                walletCore,
                jettonAddress: shouldBePresent(jettonAddress, 'Jetton address'),
                isActiveDestination,
              }),
        ]

  const input = TW.TheOpenNetwork.Proto.SigningInput.create({
    walletVersion: TW.TheOpenNetwork.Proto.WalletVersion.WALLET_V4_R2,
    expireAt: Number(expireAt.toString()),
    sequenceNumber: Number(sequenceNumber.toString()),
    messages,
    publicKey: getKeysignTwPublicKey(keysignPayload),
  })

  return [input]
}
