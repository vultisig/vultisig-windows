import { getEip712SignedPrimaryType } from '@core/inpage-provider/popup/eip712'
import {
  Eip712V4Payload,
  isEip712V4Payload,
} from '@core/inpage-provider/popup/interface'
import { CopyableHexRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/CopyableHexRow'
import { LabeledValueRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/LabeledValueRow'
import { PermitTokenRow } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/PermitTokenRow'
import { TypedDataDisplay } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/TypedDataDisplay'
import {
  Divider,
  Section,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { toBigInt } from '@core/inpage-provider/popup/view/resolvers/signMessage/utils/toBigInt'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { TypedDataDomain } from 'ethers'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

type Eip712PermitDisplayProps = {
  chain: EvmChain
  payload: Eip712V4Payload
}

/** One token a permit lets the spender move, with its approved amount. */
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

const permitParsers = {
  Permit: parseEip2612Permit,
  PermitSingle: parsePermitSingle,
  PermitBatch: parsePermitBatch,
  PermitTransferFrom: parsePermitTransferFrom,
  PermitBatchTransferFrom: parsePermitBatchTransferFrom,
} satisfies Record<string, PermitParser>

// Own-property check so a type named e.g. `constructor` never picks up an
// `Object.prototype` member as its parser.
const isPermitPrimaryType = (
  primaryType: string
): primaryType is keyof typeof permitParsers =>
  Object.prototype.hasOwnProperty.call(permitParsers, primaryType)

type ParsePermitInput = {
  payload: Eip712V4Payload
  primaryType: string
}

const parsePermit = ({
  payload,
  primaryType,
}: ParsePermitInput): PermitInfo | null => {
  if (!isPermitPrimaryType(primaryType)) return null
  const parsed = permitParsers[primaryType](payload.message, payload.domain)
  if (!parsed) return null
  return { ...parsed, primaryType }
}

// Permit2 uses uint48 for expiration; uint48 max == "no expiry".
const uint48Max = (1n << 48n) - 1n

const formatDeadline = (deadline: bigint, fallback: string): string => {
  if (deadline === 0n || deadline >= uint48Max) return fallback
  const ms = deadline * 1000n
  if (ms > BigInt(Number.MAX_SAFE_INTEGER)) return fallback
  return new Date(Number(ms)).toLocaleString()
}

/**
 * Readable review of an `eth_signTypedData_v4` request: a token-approval
 * summary for recognised permits, and a field-by-field breakdown of any
 * other payload. Both key off the primary type the hash signs, not the one
 * the page declares.
 */
export const Eip712PermitDisplay: FC<Eip712PermitDisplayProps> = ({
  chain,
  payload,
}) => {
  const { t } = useTranslation()

  // The page can post the popup call without the inpage provider, and the
  // background does not check typed-data payloads, so a malformed one shows
  // only the raw message instead of crashing the screen.
  if (!isEip712V4Payload(payload)) return null

  const primaryType = getEip712SignedPrimaryType(payload)
  const permitInfo = parsePermit({ payload, primaryType })

  if (!permitInfo) {
    return <TypedDataDisplay payload={payload} primaryType={primaryType} />
  }

  const noExpiryLabel = t('no_expiry')

  return (
    <Section gap={12} padding={24}>
      <LabeledValueRow label={t('action')} value={t('token_approval')} />
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
              <LabeledValueRow
                label={t('approval_expires')}
                value={formatDeadline(token.expiration, noExpiryLabel)}
              />
            </>
          )}
        </Fragment>
      ))}
      <Divider />
      <CopyableHexRow label={t('spender')} value={permitInfo.spender} />
      {permitInfo.deadline !== undefined && (
        <>
          <Divider />
          <LabeledValueRow
            label={t('deadline')}
            value={formatDeadline(permitInfo.deadline, noExpiryLabel)}
          />
        </>
      )}
    </Section>
  )
}
