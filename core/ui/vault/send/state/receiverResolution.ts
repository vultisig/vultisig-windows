import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { Chain } from '@vultisig/core-chain/Chain'
import { NameServiceName } from '@vultisig/core-chain/nameService/getNameServiceName'
import { NameServiceResolution } from '@vultisig/core-chain/nameService/NameServiceResolution'

/**
 * What the receiver field stands for. An address is sent to as entered. A
 * name (`.eth`, `.thor`, `.maya`, the suffix optional on Ethereum, THORChain
 * and MayaChain respectively) is looked
 * up once typing settles and replaced in the field by its address, which
 * keeps the name as its label only on the chain it was resolved for.
 */
export type SendReceiverResolution =
  | { kind: 'address'; address: string }
  | { kind: 'pending'; name: string }
  | { kind: 'resolving'; name: string }
  | { kind: 'resolved'; name: string; address: string }
  | { kind: 'notFound'; name: string }
  | { kind: 'noAddressForChain'; name: string }
  | { kind: 'lookupFailed'; name: string }

export const [SendReceiverResolutionValueProvider, useSendReceiverResolution] =
  setupValueProvider<SendReceiverResolution>('SendReceiverResolution')

/** A name the field was replaced with the address of, and the chain that address is for. */
export type ResolvedReceiverName = {
  name: string
  chain: Chain
  address: string
}

/**
 * A name the field reads as. A bare name that is not registered is taken as
 * the mistyped address it more likely is, as iOS does.
 */
export type TypedReceiverName = {
  name: NameServiceName
  isBare: boolean
}

type GetSendReceiverResolutionInput = {
  input: string
  chain: Chain
  resolvedName: ResolvedReceiverName | null
  typedName: TypedReceiverName | null
  isTyping: boolean
  lookup: {
    data: NameServiceResolution | undefined
    error: unknown
    isFetching: boolean
  }
}

/**
 * Combines the receiver field with the name it was resolved from or reads
 * as, and that name's lookup. An address resolved for another chain is never
 * used: the name has to be looked up again for the selected one.
 */
export const getSendReceiverResolution = ({
  input,
  chain,
  resolvedName,
  typedName,
  isTyping,
  lookup,
}: GetSendReceiverResolutionInput): SendReceiverResolution => {
  if (resolvedName && input === resolvedName.address) {
    return resolvedName.chain === chain
      ? { kind: 'resolved', ...resolvedName }
      : { kind: 'pending', name: resolvedName.name }
  }

  if (!typedName) {
    return { kind: 'address', address: input }
  }

  const { name } = typedName.name

  if (isTyping) {
    return { kind: 'pending', name }
  }

  const { data, error, isFetching } = lookup

  if (data) {
    if (data.kind === 'resolved') {
      return { kind: 'resolved', name, address: data.address }
    }

    if (data.kind === 'notFound' && typedName.isBare) {
      return { kind: 'address', address: input }
    }

    return { kind: data.kind, name }
  }

  if (error && !isFetching) {
    return { kind: 'lookupFailed', name }
  }

  return { kind: 'resolving', name }
}

/**
 * The address the send goes to: the address entered, or the one a name
 * resolved to on the selected chain. Empty while a name has no address.
 */
export const getSendReceiverAddress = (
  resolution: SendReceiverResolution
): string => ('address' in resolution ? resolution.address : '')

/** The address the send goes to; see `getSendReceiverAddress`. */
export const useSendReceiverAddress = () =>
  getSendReceiverAddress(useSendReceiverResolution())

/**
 * The name the receiver address was resolved from, shown beside it on review
 * and after signing. Empty for an address entered as is.
 */
export const useSendReceiverLabel = () => {
  const resolution = useSendReceiverResolution()

  return resolution.kind === 'resolved' ? resolution.name : ''
}
