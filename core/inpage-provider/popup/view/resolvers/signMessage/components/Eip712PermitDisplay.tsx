import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { PermitTokenRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/PermitTokenRow'
import {
  Divider,
  Section,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { TypedDataDomain } from 'ethers'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type Eip712PermitDisplayProps = {
  chain: EvmChain
  payload: Eip712V4Payload
}

export type PermitToken = {
  address: string
  amount: bigint
  expiration?: bigint
}

type PermitInfo = {
  spender: string
  tokens: PermitToken[]
  deadline?: bigint
  primaryType: string
}

type PermitParser = (
  message: Record<string, unknown>,
  domain: TypedDataDomain
) => Omit<PermitInfo, 'primaryType'> | null

const isString = (v: unknown): v is string => typeof v === 'string'

const isObjectRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isArrayOfRecords = (v: unknown): v is Record<string, unknown>[] =>
  Array.isArray(v) && v.every(isObjectRecord)

const toBigInt = (v: unknown): bigint | undefined => {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number' && Number.isInteger(v)) return BigInt(v)
  if (typeof v === 'string' && v.length > 0) {
    try {
      return BigInt(v)
    } catch {
      return undefined
    }
  }
  return undefined
}

const parseEip2612Permit: PermitParser = (message, domain) => {
  if (!isString(domain.verifyingContract)) return null
  if (!isString(message.spender)) return null
  // EIP-2612 uses `value`; DAI variant uses `allowed` (boolean) — coerce
  // truthy to MAX_UINT256, falsy to 0n so the same UI path applies.
  const daiAllowed = typeof message.allowed === 'boolean'
  const amount = daiAllowed
    ? message.allowed
      ? 2n ** 256n - 1n
      : 0n
    : toBigInt(message.value)
  if (amount === undefined) return null
  const deadline = toBigInt(message.deadline) ?? toBigInt(message.expiry)
  return {
    spender: message.spender,
    tokens: [{ address: domain.verifyingContract, amount }],
    deadline,
  }
}

const parsePermitSingle: PermitParser = message => {
  if (!isString(message.spender)) return null
  if (!isObjectRecord(message.details)) return null
  const { token, amount, expiration } = message.details
  if (!isString(token)) return null
  const amountBig = toBigInt(amount)
  if (amountBig === undefined) return null
  return {
    spender: message.spender,
    tokens: [
      { address: token, amount: amountBig, expiration: toBigInt(expiration) },
    ],
    deadline: toBigInt(message.sigDeadline),
  }
}

const parsePermitBatch: PermitParser = message => {
  if (!isString(message.spender)) return null
  if (!isArrayOfRecords(message.details)) return null
  const tokens: PermitToken[] = []
  for (const detail of message.details) {
    if (!isString(detail.token)) return null
    const amount = toBigInt(detail.amount)
    if (amount === undefined) return null
    tokens.push({
      address: detail.token,
      amount,
      expiration: toBigInt(detail.expiration),
    })
  }
  return {
    spender: message.spender,
    tokens,
    deadline: toBigInt(message.sigDeadline),
  }
}

const parsePermitTransferFrom: PermitParser = message => {
  if (!isString(message.spender)) return null
  if (!isObjectRecord(message.permitted)) return null
  const { token, amount } = message.permitted
  if (!isString(token)) return null
  const amountBig = toBigInt(amount)
  if (amountBig === undefined) return null
  return {
    spender: message.spender,
    tokens: [{ address: token, amount: amountBig }],
    deadline: toBigInt(message.deadline),
  }
}

const parsePermitBatchTransferFrom: PermitParser = message => {
  if (!isString(message.spender)) return null
  if (!isArrayOfRecords(message.permitted)) return null
  const tokens: PermitToken[] = []
  for (const permitted of message.permitted) {
    if (!isString(permitted.token)) return null
    const amount = toBigInt(permitted.amount)
    if (amount === undefined) return null
    tokens.push({ address: permitted.token, amount })
  }
  return {
    spender: message.spender,
    tokens,
    deadline: toBigInt(message.deadline),
  }
}

const permitParsers: Record<string, PermitParser> = {
  Permit: parseEip2612Permit,
  PermitSingle: parsePermitSingle,
  PermitBatch: parsePermitBatch,
  PermitTransferFrom: parsePermitTransferFrom,
  PermitBatchTransferFrom: parsePermitBatchTransferFrom,
}

const parsePermit = (payload: Eip712V4Payload): PermitInfo | null => {
  const parser = permitParsers[payload.primaryType]
  if (!parser) return null
  const parsed = parser(payload.message, payload.domain)
  if (!parsed) return null
  return { ...parsed, primaryType: payload.primaryType }
}

// Permit2 uses uint48 for expiration; uint48 max == "no expiry".
const uint48Max = (1n << 48n) - 1n

const formatDeadline = (deadline: bigint, fallback: string): string => {
  if (deadline === 0n || deadline >= uint48Max) return fallback
  const ms = deadline * 1000n
  if (ms > BigInt(Number.MAX_SAFE_INTEGER)) return fallback
  return new Date(Number(ms)).toLocaleString()
}

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// Long, unbroken values (keys, hashes) are flex items inside a nowrap row.
// `min-width: 0` lets the cell shrink below its content so `break-word` can
// wrap instead of widening the row and forcing horizontal scroll.
const RowValue = styled(Text)`
  min-width: 0;
  flex: 1;
  text-align: right;
`

const Row: FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <HStack
    alignItems="center"
    gap={8}
    justifyContent="space-between"
    wrap="nowrap"
  >
    <Text as="span" color="shy" size={14} weight={500} nowrap>
      {label}
    </Text>
    {typeof value === 'string' ? (
      <RowValue as="span" size={14} weight={500}>
        {value}
      </RowValue>
    ) : (
      value
    )}
  </HStack>
)

export const Eip712PermitDisplay: FC<Eip712PermitDisplayProps> = ({
  chain,
  payload,
}) => {
  const { t } = useTranslation()
  const permitInfo = parsePermit(payload)

  if (!permitInfo) {
    const { domain, primaryType, message } = payload
    const entries = Object.entries(message)
    return (
      <Section gap={12} padding={24}>
        {isString(domain.name) && (
          <>
            <Row label={t('domain')} value={domain.name} />
            <Divider />
          </>
        )}
        {domain.chainId !== undefined && (
          <>
            <Row
              label={t('chain_id')}
              value={formatPrimitive(domain.chainId)}
            />
            <Divider />
          </>
        )}
        <Row label={t('primary_type')} value={primaryType} />
        {entries.map(([key, value]) => (
          <Fragment key={key}>
            <Divider />
            <Row label={key} value={formatPrimitive(value)} />
          </Fragment>
        ))}
      </Section>
    )
  }

  const noExpiryLabel = t('no_expiry')

  return (
    <Section gap={12} padding={24}>
      <Row label={t('action')} value={t('token_approval')} />
      {permitInfo.tokens.map((token, index) => (
        <Fragment key={`${token.address}-${index}`}>
          <Divider />
          <PermitTokenRow
            chain={chain}
            token={token}
            primaryType={permitInfo.primaryType}
          />
          {token.expiration !== undefined && (
            <>
              <Divider />
              <Row
                label={t('approval_expires')}
                value={formatDeadline(token.expiration, noExpiryLabel)}
              />
            </>
          )}
        </Fragment>
      ))}
      <Divider />
      <Row
        label={t('spender')}
        value={
          <MiddleTruncate
            justifyContent="end"
            size={14}
            text={permitInfo.spender}
            weight={500}
            flexGrow
          />
        }
      />
      {permitInfo.deadline !== undefined && (
        <>
          <Divider />
          <Row
            label={t('deadline')}
            value={formatDeadline(permitInfo.deadline, noExpiryLabel)}
          />
        </>
      )}
    </Section>
  )
}
