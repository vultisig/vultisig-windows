import { Chain } from '@vultisig/core-chain/Chain'
import { ChainKind, getChainKind } from '@vultisig/core-chain/ChainKind'
import { TFunction } from 'i18next'

type GetReceiverAddressFormatHintInput = {
  chain: Chain
  senderAddress: string
  t: TFunction
}

// Bech32 addresses are `<hrp>1<data>`; the human-readable prefix never contains
// the `1` separator, so the first segment is the expected chain prefix. The
// sender is always a valid address on the same chain, making it a reliable
// source for the receiver's expected prefix.
const getBech32Prefix = (address: string): string =>
  address.trim().split('1')[0]

/**
 * Returns a human-readable hint describing the recipient address format expected
 * for the given chain. Used to explain why a recipient was rejected so the user
 * can correct it. Resolved per chain kind so every supported chain surfaces
 * guidance without per-chain branching.
 */
export const getReceiverAddressFormatHint = ({
  chain,
  senderAddress,
  t,
}: GetReceiverAddressFormatHintInput): string => {
  const hintByKind: Record<ChainKind, () => string> = {
    evm: () => t('send_receiver_format_hint_evm'),
    utxo: () => t('send_receiver_format_hint_utxo'),
    cosmos: () =>
      t('send_receiver_format_hint_cosmos', {
        prefix: getBech32Prefix(senderAddress),
      }),
    solana: () => t('send_receiver_format_hint_solana'),
    sui: () => t('send_receiver_format_hint_sui'),
    polkadot: () => t('send_receiver_format_hint_ss58'),
    bittensor: () => t('send_receiver_format_hint_ss58'),
    ton: () => t('send_receiver_format_hint_ton'),
    ripple: () => t('send_receiver_format_hint_ripple'),
    tron: () => t('send_receiver_format_hint_tron'),
    cardano: () => t('send_receiver_format_hint_cardano'),
    qbtc: () => t('send_receiver_format_hint_qbtc'),
  }

  return hintByKind[getChainKind(chain)]()
}
