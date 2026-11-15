import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { ChildrenProp } from '@lib/ui/props'
import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { isNameServiceChain } from '@vultisig/core-chain/nameService'
import {
  getBareNameServiceName,
  getNameServiceName,
} from '@vultisig/core-chain/nameService/getNameServiceName'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { useEffect, useState } from 'react'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useSendReceiverNameQuery } from '../queries/useSendReceiverNameQuery'
import { useSendFormFieldState } from './formFields'
import { useSendReceiver } from './receiver'
import {
  getSendReceiverResolution,
  ResolvedReceiverName,
  SendReceiverResolutionValueProvider,
  TypedReceiverName,
} from './receiverResolution'
import { useCurrentSendCoin } from './sendCoin'

// iOS waits a second after the last keystroke before looking a name up.
const nameLookupDelayMs = 1000

type GetTypedReceiverNameInput = {
  input: string
  chain: Chain
  walletCore: WalletCore
}

// A suffixed name counts only on a chain its service can hold an address
// for. On any other chain the input is validated as an address: a NEAR
// account may well end in `.thor`. A bare name counts only when the input is
// not already an address: on Ethereum any address reads as an ENS label too.
const getTypedReceiverName = ({
  input,
  chain,
  walletCore,
}: GetTypedReceiverNameInput): TypedReceiverName | null => {
  const name = getNameServiceName(input)
  if (name) {
    return isNameServiceChain({ service: name.service, chain })
      ? { name, isBare: false }
      : null
  }

  const bareName = getBareNameServiceName({ input, chain })
  if (!bareName || isValidAddress({ chain, address: input, walletCore })) {
    return null
  }

  return { name: bareName, isBare: true }
}

/**
 * Resolves the receiver field for the selected chain, once, for every part of
 * the send flow that needs its address. As on iOS, a name (with its suffix,
 * or without it on THORChain, MayaChain and Ethereum) is looked up a second
 * after typing stops, replaced in the field by its address, and the form
 * moves on to the amount. Switching chain puts the name back in the field to
 * be looked up for the new chain; the address it had on the previous chain is
 * never sent to.
 */
export const SendReceiverResolutionProvider = ({ children }: ChildrenProp) => {
  const [input, setInput] = useSendReceiver()
  const [, setFocusedSendField] = useSendFormFieldState()
  const { chain } = useCurrentSendCoin()
  const walletCore = useAssertWalletCore()
  const [resolvedName, setResolvedName] = useState<ResolvedReceiverName | null>(
    null
  )
  const isTyping = useDebounce(input, nameLookupDelayMs) !== input

  const holdsResolvedAddress =
    resolvedName !== null && input === resolvedName.address
  // An address a name resolved to is not read as a name of its own.
  const typedName = holdsResolvedAddress
    ? null
    : getTypedReceiverName({ input, chain, walletCore })
  const lookup = useSendReceiverNameQuery({
    name: typedName ? typedName.name : null,
    chain,
    enabled: !isTyping,
  })
  const resolution = getSendReceiverResolution({
    input,
    chain,
    resolvedName,
    typedName,
    isTyping,
    lookup,
  })

  const nameToRestore =
    holdsResolvedAddress && resolvedName.chain !== chain
      ? resolvedName.name
      : null
  const newlyResolved =
    resolution.kind === 'resolved' && resolution.address !== input
      ? resolution
      : null
  const newlyResolvedName = newlyResolved ? newlyResolved.name : null
  const newlyResolvedAddress = newlyResolved ? newlyResolved.address : null

  useEffect(() => {
    if (nameToRestore !== null) {
      setInput(nameToRestore)
      return
    }

    if (newlyResolvedName === null || newlyResolvedAddress === null) {
      return
    }

    setResolvedName({
      name: newlyResolvedName,
      chain,
      address: newlyResolvedAddress,
    })
    setInput(newlyResolvedAddress)
    setFocusedSendField(state =>
      state.field === 'address' ? { ...state, field: 'amount' } : state
    )
  }, [
    chain,
    nameToRestore,
    newlyResolvedAddress,
    newlyResolvedName,
    setFocusedSendField,
    setInput,
  ])

  return (
    <SendReceiverResolutionValueProvider value={resolution}>
      {children}
    </SendReceiverResolutionValueProvider>
  )
}
