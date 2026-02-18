import { Chain } from '@core/chain/Chain'
import { getEvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { FC } from 'react'

import { Transaction } from '../../../types'
import { AddressValue } from '../../shared/AddressValue'
import { DetailRow } from '../../shared/DetailRow'
import { TransactionDetailsSection } from '../TransactionDetailsSection'
import { parseDecodedParams } from '../utils'

type Props = {
  transaction: Transaction
  chain: string
  sender: string
}

export const ApprovalTransactionCard: FC<Props> = ({
  transaction,
  chain,
  sender,
}) => {
  const meta = transaction.metadata ?? {}
  const tokenSymbol = (meta.token_symbol as string) ?? ''
  const tokenDecimals = (meta.token_decimals as number) ?? 18

  const resolvedChain = chain as Chain | null

  const normalizeHex = (hex: string) =>
    hex.startsWith('0x') ? hex : `0x${hex}`

  const txDataHex = transaction.tx_data.data
    ? normalizeHex(transaction.tx_data.data)
    : ''

  const calldataQuery = useQuery({
    queryKey: ['approvalCalldata', txDataHex.slice(0, 10)],
    queryFn: () => getEvmContractCallInfo(txDataHex),
    enabled: txDataHex.length >= 10,
  })

  const approvalAmount = (() => {
    const decoded = calldataQuery.data
    if (!decoded) return null
    const params = parseDecodedParams(
      decoded.functionSignature,
      decoded.functionArguments,
      tokenDecimals
    )
    const amountParam = params.find(p => p.type === 'uint256')
    if (!amountParam) return null
    return amountParam.formatted ?? amountParam.value
  })()

  return (
    <VStack gap={12}>
      <HStack gap={8} alignItems="center">
        <Text size={13} weight={600}>
          {transaction.label}
        </Text>
        {tokenSymbol && (
          <Text size={12} color="supporting">
            {tokenSymbol}
          </Text>
        )}
      </HStack>

      <DetailRow style={{ padding: '4px 0' }}>
        <Text size={12} color="supporting">
          Spender
        </Text>
        <AddressValue
          address={transaction.tx_data.to}
          chain={resolvedChain}
          selfAddress={sender}
        />
      </DetailRow>

      {approvalAmount && (
        <DetailRow style={{ padding: '4px 0' }}>
          <Text size={12} color="supporting">
            Approval Amount
          </Text>
          <Text size={12} weight={500}>
            {approvalAmount} {tokenSymbol}
          </Text>
        </DetailRow>
      )}

      <TransactionDetailsSection
        tx={transaction.tx_data}
        chain={chain}
        sender={sender}
        label="Approval"
        tokenDecimals={tokenDecimals}
      />
    </VStack>
  )
}
