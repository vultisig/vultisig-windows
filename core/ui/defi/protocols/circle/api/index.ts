import { queryUrl } from '@lib/utils/query/queryUrl'

import {
  ContractExecutionResponse,
  CreateWalletResponse,
  CreateWalletSetResponse,
  GetTransactionResponse,
} from './types'

const circleApiBase = 'https://api.vultisig.com/circle/v1/w3s'

export const createWalletSet = async () => {
  const response = await queryUrl<CreateWalletSetResponse>(
    `${circleApiBase}/developer/walletSets`,
    {
      body: {
        idempotencyKey: crypto.randomUUID(),
        name: `Vultisig MSCA ${Date.now()}`,
      },
    }
  )

  return response.data.walletSet
}

type CreateMscaWalletInput = {
  walletSetId: string
  blockchain: string
}

export const createMscaWallet = async ({
  walletSetId,
  blockchain,
}: CreateMscaWalletInput) => {
  const response = await queryUrl<CreateWalletResponse>(
    `${circleApiBase}/developer/wallets`,
    {
      body: {
        idempotencyKey: crypto.randomUUID(),
        accountType: 'SCA',
        blockchains: [blockchain],
        count: 1,
        walletSetId,
      },
    }
  )

  const [wallet] = response.data.wallets
  if (!wallet) {
    throw new Error('No wallet returned from Circle API')
  }

  return wallet
}

type TransferOwnershipInput = {
  walletId: string
  mscaAddress: string
  newOwnerAddress: string
}

export const transferMscaOwnership = async ({
  walletId,
  mscaAddress,
  newOwnerAddress,
}: TransferOwnershipInput) => {
  const response = await queryUrl<ContractExecutionResponse>(
    `${circleApiBase}/developer/transactions/contractExecution`,
    {
      body: {
        idempotencyKey: crypto.randomUUID(),
        abiFunctionSignature: 'transferNativeOwnership(address)',
        abiParameters: [newOwnerAddress],
        contractAddress: mscaAddress,
        walletId,
        feeLevel: 'MEDIUM',
        refId: 'Transfer ownership to Vultisig EOA',
      },
    }
  )

  return response.data
}

const getTransaction = async (transactionId: string) => {
  const response = await queryUrl<GetTransactionResponse>(
    `${circleApiBase}/transactions/${transactionId}`
  )

  return response.data.transaction
}

export const waitForTransactionConfirmation = async (
  transactionId: string,
  maxAttempts = 30,
  delayMs = 2000
): Promise<GetTransactionResponse['data']['transaction']> => {
  for (let i = 0; i < maxAttempts; i++) {
    const transaction = await getTransaction(transactionId)

    if (transaction.state === 'COMPLETE' || transaction.state === 'CONFIRMED') {
      return transaction
    }

    if (transaction.state === 'FAILED' || transaction.state === 'CANCELLED') {
      throw new Error(`Transaction ${transaction.state.toLowerCase()}`)
    }

    await new Promise(resolve => setTimeout(resolve, delayMs))
  }

  throw new Error('Transaction confirmation timeout')
}
