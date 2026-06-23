import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenInstruction,
} from '@solana/spl-token'
import {
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import { SignSolana } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { useTranslation } from 'react-i18next'
import styled, { CSSProperties } from 'styled-components'

type Styles = {
  color: ThemeColor
  fontSize: NonNullable<CSSProperties['fontSize']>
}

const StyledTitle = styled.span<Styles>`
  color: ${({ color }) => getColor(color)};
  font-size: ${({ fontSize }) => toSizeUnit(fontSize)};
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

type InstructionSummary = {
  transactionIndex: number
  index: number
  programId: string
  instructionType: string | null
  accountsCount: number
  dataLength: number
}

type ParseSolanaTransactionInstructionsInput = {
  rawMessageBase64: string
  transactionIndex: number
}

const systemProgramId = SystemProgram.programId.toBase58()
const tokenProgramIdStr = TOKEN_PROGRAM_ID.toBase58()
const associatedTokenProgramIdStr = ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()

const getInstructionType = (
  programId: string,
  instructionData: Uint8Array
): string | null => {
  if (programId === systemProgramId) {
    if (instructionData.length === 0) return null
    const discriminator = instructionData[0]
    switch (discriminator) {
      case 0:
        return 'Create Account'
      case 2:
        return 'Transfer (SOL)'
      case 3:
        return 'Assign'
      case 4:
        return 'Create Account With Seed'
      case 9:
        return 'Transfer With Seed'
      default:
        return `System (${discriminator})`
    }
  }

  if (programId === tokenProgramIdStr) {
    if (instructionData.length === 0) return null
    const discriminator = instructionData[0]
    const instructionName = TokenInstruction[discriminator]
    if (instructionName) {
      return instructionName
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, str => str.toUpperCase())
    }
    return `Token (${discriminator})`
  }

  if (programId === associatedTokenProgramIdStr) {
    return 'Create Associated Token Account'
  }

  return null
}

const parseSolanaTransactionInstructions = ({
  rawMessageBase64,
  transactionIndex,
}: ParseSolanaTransactionInstructionsInput): InstructionSummary[] => {
  try {
    const buffer = Buffer.from(rawMessageBase64, 'base64')
    const txInputDataArray = Object.values(buffer)
    const txInputDataBuffer = new Uint8Array(txInputDataArray as any)

    try {
      const versionedTx = VersionedTransaction.deserialize(txInputDataBuffer)
      const message = versionedTx.message

      return message.compiledInstructions.map((ix, index) => {
        const programIdIndex = ix.programIdIndex
        const programId =
          message.staticAccountKeys[programIdIndex]?.toBase58() ||
          `Account[${programIdIndex}]`

        const instructionData = new Uint8Array(ix.data)
        const instructionType = getInstructionType(programId, instructionData)

        return {
          transactionIndex,
          index: index + 1,
          programId,
          instructionType,
          accountsCount: ix.accountKeyIndexes.length,
          dataLength: ix.data.length,
        }
      })
    } catch {
      const legacyTx = Transaction.from(txInputDataBuffer)

      return legacyTx.instructions.map((ix, index) => {
        const instructionData = new Uint8Array(ix.data)
        const instructionType = getInstructionType(
          ix.programId.toBase58(),
          instructionData
        )

        return {
          transactionIndex,
          index: index + 1,
          programId: ix.programId.toBase58(),
          instructionType,
          accountsCount: ix.keys.length,
          dataLength: ix.data.length,
        }
      })
    }
  } catch {
    return []
  }
}

export const SignSolanaDisplay = ({
  signSolana,
}: {
  signSolana: SignSolana
}) => {
  const { t } = useTranslation()
  const instructionsSummary = signSolana.rawTransactions.flatMap((tx, index) =>
    parseSolanaTransactionInstructions({
      rawMessageBase64: tx,
      transactionIndex: index + 1,
    })
  )
  const transactionCount = signSolana.rawTransactions.length
  const rawTransactionData =
    transactionCount <= 1
      ? signSolana.rawTransactions.join('\n')
      : signSolana.rawTransactions
          .map((transaction, index) => `#${index + 1}\n${transaction}`)
          .join('\n\n')

  return (
    <VStack gap={16}>
      {instructionsSummary.length > 0 && (
        <Panel>
          <VStack gap={12}>
            <StyledTitle color={'text'} fontSize={14}>
              {t('transaction_instructions_summary')}
            </StyledTitle>
            <VStack gap={8}>
              {instructionsSummary.map(ix => (
                <VStack key={`${ix.transactionIndex}-${ix.index}`} gap={4}>
                  <Text size={13} weight={500} color="contrast">
                    {t('instruction')} {ix.transactionIndex}.{ix.index}
                    {ix.instructionType && `: ${ix.instructionType}`}
                  </Text>
                  <Text size={12} color="shy">
                    {t('program_id')}: {ix.programId}
                  </Text>
                  <Text size={12} color="shy">
                    {t('accounts')}: {ix.accountsCount} | {t('data_length')}:{' '}
                    {ix.dataLength} {t('bytes')}
                  </Text>
                </VStack>
              ))}
            </VStack>
          </VStack>
        </Panel>
      )}
      <Panel>
        <VStack gap={12} scrollable={true}>
          <StyledTitle color={'text'} fontSize={14}>
            {t('raw_transaction_data')} ({transactionCount})
          </StyledTitle>
          <Text color="info" family="mono" size={14} weight={500}>
            <pre
              style={{
                width: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
                margin: 0,
              }}
            >
              <code
                style={{
                  display: 'block',
                  width: '100%',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                }}
              >
                {rawTransactionData}
              </code>
            </pre>
          </Text>
        </VStack>
      </Panel>
    </VStack>
  )
}
