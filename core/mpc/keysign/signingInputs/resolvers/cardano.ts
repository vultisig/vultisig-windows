import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { SigningInputsResolver } from '../resolver'

export const getCardanoSigningInputs: SigningInputsResolver<'cardano'> = ({
  keysignPayload,
  walletCore,
}) => {
  const { sendMaxAmount, ttl } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'cardano'
  )

  const coin = shouldBePresent(keysignPayload.coin)

  // For Cardano tokens, contractAddress contains the token ID (policy_id + asset_name_hex)
  const tokenId = coin.contractAddress || ''
  const isToken = tokenId.length > 0

  const tokenAmount = isToken
    ? TW.Cardano.Proto.TokenBundle.create({
        token: [
          TW.Cardano.Proto.TokenAmount.create({
            policyId: tokenId.slice(0, 56),
            assetName: '',
            assetNameHex: tokenId.slice(56),
            amount: walletCore.HexCoding.decode(
              BigInt(keysignPayload.toAmount).toString(16).padStart(64, '0')
            ),
          }),
        ],
      })
    : undefined

  const input = TW.Cardano.Proto.SigningInput.create({
    transferMessage: TW.Cardano.Proto.Transfer.create({
      toAddress: keysignPayload.toAddress,
      changeAddress: coin.address,
      amount: Long.fromString(keysignPayload.toAmount),
      useMaxAmount: sendMaxAmount,
      tokenAmount,
    }),
    ttl: Long.fromString(ttl.toString()),

    utxos: keysignPayload.utxoInfo.map(({ hash, amount, index }) =>
      TW.Cardano.Proto.TxInput.create({
        outPoint: TW.Cardano.Proto.OutPoint.create({
          txHash: walletCore.HexCoding.decode(stripHexPrefix(hash)),
          outputIndex: Long.fromString(index.toString()),
        }),
        amount: Long.fromString(amount.toString()),
        address: coin.address,
      })
    ),
  })

  return [input]
}
