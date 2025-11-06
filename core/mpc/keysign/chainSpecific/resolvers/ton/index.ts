import { create } from '@bufbuild/protobuf'
import { getTonAccountInfo } from '@core/chain/chains/ton/account/getTonAccountInfo'
import {
  getJettonWalletAddress,
  getTonWalletState,
} from '@core/chain/chains/ton/api'
import { TonSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { attempt } from '@lib/utils/attempt'

import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../../resolver'

const tonWalletStateUninitialized = 'uninit'

export const getTonChainSpecific: GetChainSpecificResolver<
  'tonSpecific'
> = async ({ keysignPayload }) => {
  const coin = getKeysignCoin(keysignPayload)
  const { address } = coin
  const receiver = keysignPayload.toAddress

  const { account_state } = await getTonAccountInfo(address)
  const sequenceNumber = BigInt(account_state.seqno || 0)

  const getIsBounceable = async () => {
    if (receiver) {
      const { data: walletState } = await attempt(getTonWalletState(receiver))
      const isUninitialized = walletState === tonWalletStateUninitialized
      if (!isUninitialized && receiver.startsWith('E')) {
        return true
      }
    }
    return false
  }

  const result = create(TonSpecificSchema, {
    sequenceNumber,
    expireAt: BigInt(Math.floor(Date.now() / 1000) + 600),
    bounceable: await getIsBounceable(),
    sendMaxAmount: false,
    jettonAddress: '',
    isActiveDestination: false,
  })

  if (coin.id) {
    const { data: jettonWallet } = await attempt(
      getJettonWalletAddress({
        ownerAddress: address,
        jettonMasterAddress: coin.id,
      })
    )

    if (jettonWallet) {
      result.jettonAddress = jettonWallet
    }

    if (receiver) {
      const { data: destWalletState } = await attempt(
        getTonWalletState(receiver)
      )
      result.isActiveDestination =
        destWalletState !== tonWalletStateUninitialized
    }
  }

  return result
}
