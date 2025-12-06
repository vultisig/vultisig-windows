import { EvmChain } from '@core/chain/Chain'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  createMscaWallet,
  createWalletSet,
  transferMscaOwnership,
  waitForTransactionConfirmation,
} from '../../api'
import { CircleAccount } from '../../api/types'

const circleChain = EvmChain.Ethereum
const circleBlockchain = 'ETH'

export const useCreateCircleAccountMutation = () => {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const ownerAddress = useCurrentVaultAddress(circleChain)

  return useMutation({
    mutationFn: async (): Promise<CircleAccount> => {
      const walletSet = await createWalletSet()
      console.log('walletSet', walletSet)

      const wallet = await createMscaWallet({
        walletSetId: walletSet.id,
        blockchain: circleBlockchain,
      })
      console.log('wallet', wallet)

      const transferTx = await transferMscaOwnership({
        walletId: wallet.id,
        mscaAddress: wallet.address,
        newOwnerAddress: ownerAddress,
      })
      console.log('transferTx', transferTx)
      await waitForTransactionConfirmation(transferTx.id)

      return {
        walletSetId: walletSet.id,
        walletId: wallet.id,
        mscaAddress: wallet.address,
        ownerAddress,
        blockchain: circleBlockchain,
        createdAt: new Date().toISOString(),
      }
    },
    onSuccess: () => {
      addToast({ message: t('circle.account_created') })
    },
    onError: error => {
      addToast({
        message:
          error instanceof Error
            ? error.message
            : t('circle.account_creation_failed'),
      })
    },
  })
}
