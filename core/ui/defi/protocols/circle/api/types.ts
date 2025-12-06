type CircleWallet = {
  id: string
  state: 'LIVE' | 'FROZEN'
  walletSetId: string
  custodyType: 'DEVELOPER'
  userId: string
  address: string
  addressIndex: number
  blockchain: string
  accountType: 'SCA' | 'EOA'
  updateDate: string
  createDate: string
}

export type CreateWalletSetResponse = {
  data: {
    walletSet: {
      id: string
      custodyType: string
      updateDate: string
      createDate: string
    }
  }
}

export type CreateWalletResponse = {
  data: {
    wallets: CircleWallet[]
  }
}

type CircleTransaction = {
  id: string
  state:
    | 'INITIATED'
    | 'PENDING_RISK_SCREENING'
    | 'QUEUED'
    | 'SENT'
    | 'CONFIRMED'
    | 'COMPLETE'
    | 'FAILED'
    | 'CANCELLED'
  txHash?: string
  createDate: string
  updateDate: string
}

export type ContractExecutionResponse = {
  data: {
    id: string
    state: CircleTransaction['state']
  }
}

export type GetTransactionResponse = {
  data: {
    transaction: CircleTransaction
  }
}

export type CircleAccount = {
  walletSetId: string
  walletId: string
  mscaAddress: string
  ownerAddress: string
  blockchain: string
  createdAt: string
}
