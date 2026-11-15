import { Chain } from '@vultisig/core-chain/Chain'
import { match } from '@vultisig/lib-utils/match'
import { TFunction } from 'i18next'

import { getChainDisplayName } from '../../../chain/metadata/getChainDisplayName'
import { SendReceiverResolution } from '../state/receiverResolution'

type GetSendReceiverNameErrorInput = {
  receiver: SendReceiverResolution
  chain: Chain
  t: TFunction
}

/**
 * Why a name leaves the send without an address. Undefined for an address
 * and for a name that resolved or is still to: once known, its address is
 * validated like an entered one.
 */
export const getSendReceiverNameError = ({
  receiver,
  chain,
  t,
}: GetSendReceiverNameErrorInput): string | undefined => {
  if (receiver.kind === 'address') {
    return undefined
  }

  const { name } = receiver

  return match<typeof receiver.kind, string | undefined>(receiver.kind, {
    pending: () => undefined,
    resolving: () => undefined,
    resolved: () => undefined,
    notFound: () => t('send_receiver_name_not_found', { name }),
    noAddressForChain: () =>
      t('send_receiver_name_no_address_for_chain', {
        name,
        chain: getChainDisplayName(chain),
      }),
    lookupFailed: () => t('send_receiver_name_lookup_failed', { name }),
  })
}
