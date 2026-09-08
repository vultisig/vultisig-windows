import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useQuery } from '@tanstack/react-query'
import { resolveTonWalletVersion } from '@vultisig/core-chain/chains/ton/wallet'
import { getKeysignTwPublicKey } from '@vultisig/core-mpc/keysign/tw/getKeysignTwPublicKey'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignTon } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import {
  buildTonEmulationBoc,
  getTonEmulationSwap,
  getTonTraceFailureCause,
  hasFailedTonEmulationAction,
  TonApiEvent,
  TonApiTrace,
  TonSimulationInfo,
} from './tonEmulation'

type UseTonSimulationInput = {
  fromAddress?: string
  keysignPayload: KeysignPayload
  signTon: SignTon
}

const getTonApiEmulateUrl = (kind: 'events' | 'traces') =>
  `https://tonapi.io/v2/${kind}/emulate?ignore_signature_check=true`

/**
 * Emulates a TON Connect transaction on TonAPI before it is signed, so the
 * keysign UI can warn when the emulator expects it to fail and can show a
 * recognized jetton swap as a quote instead of the raw messages. The wallet
 * contract is resolved from the sender address the way the signer resolves
 * it, so V4R2 and W5 accounts are each emulated as themselves. A transport or
 * emulator error leaves the query in its error state and the UI falls back to
 * the decoded messages.
 */
export const useTonSimulation = ({
  fromAddress,
  keysignPayload,
  signTon,
}: UseTonSimulationInput) => {
  const walletCore = useAssertWalletCore()
  const tonSpecific =
    keysignPayload.blockchainSpecific.case === 'tonSpecific'
      ? keysignPayload.blockchainSpecific.value
      : null

  return useQuery({
    queryKey: [
      'tonSimulation',
      fromAddress,
      signTon.tonMessages.map(({ amount, payload, stateInit, to }) => ({
        amount,
        payload,
        stateInit,
        to,
      })),
      tonSpecific?.sequenceNumber.toString(),
      tonSpecific?.expireAt.toString(),
    ],
    queryFn: async (): Promise<TonSimulationInfo | null> => {
      if (!fromAddress || !tonSpecific) return null

      const walletVersion = resolveTonWalletVersion({
        address: fromAddress,
        publicKey: walletCore.PublicKey.createWithData(
          getKeysignTwPublicKey(keysignPayload),
          walletCore.PublicKeyType.ed25519
        ),
        walletCore,
      })

      const boc = buildTonEmulationBoc({
        expireAt: tonSpecific.expireAt,
        fromAddress,
        sequenceNumber: tonSpecific.sequenceNumber,
        tonMessages: signTon.tonMessages,
        walletVersion,
      })

      const event = await queryUrl<TonApiEvent>(getTonApiEmulateUrl('events'), {
        body: { boc },
      })
      const swap = getTonEmulationSwap(event)

      if (!hasFailedTonEmulationAction(event)) return { failure: null, swap }

      // The verdict is already in hand; the trace only explains it. Losing the
      // trace to a rate limit or a timeout must not lose the warning.
      const { data: trace } = await attempt(
        queryUrl<TonApiTrace>(getTonApiEmulateUrl('traces'), { body: { boc } })
      )

      return {
        failure: { cause: trace ? getTonTraceFailureCause(trace) : null },
        swap,
      }
    },
    enabled: !!fromAddress && !!tonSpecific && signTon.tonMessages.length > 0,
    retry: false,
    staleTime: Infinity,
  })
}
