import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { bigishToString, emptyToUndefined } from '../utils'
import { mapNestedCoin } from './mapNestedCoin'

// ---------- debug helper (no-op unless DEBUG_SWAP is set) ----------
const swapDebug = (...args: any[]) => {
  if (!process.env.DEBUG_SWAP) return
  // stderr tends to show up even when test runners quiet stdout
  console.error('[swap-debug]', ...args)
}

// BigInt-safe JSON.stringify for clean logs
const json = (v: any) =>
  JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? x.toString() : x), 2)

// log which module is actually running (helps catch path/caching issues)
swapDebug('mapper file:', __filename)

export const mapSwapPayload = (
  spRaw: any
): KeysignPayload['swapPayload'] | undefined => {
  if (!spRaw) {
    swapDebug('no swap payload provided')
    return undefined
  }

  // peek at what we got
  try {
    const keys = Object.keys(spRaw || {})
    swapDebug('input keys', keys)
    swapDebug(
      'has.Oneinch/oneinch/OneInch:',
      !!spRaw.OneinchSwapPayload,
      !!spRaw.oneinchSwapPayload,
      !!spRaw.OneInchSwapPayload
    )
    swapDebug(
      'has.Thorchain:',
      !!(spRaw.ThorchainSwapPayload || spRaw.thorchainSwapPayload)
    )
  } catch {
    // ignore debug issues
  }

  // ---------- OneInch / Lifiswap (EVM & Solana) ----------
  if (
    spRaw.OneinchSwapPayload ||
    spRaw.oneinchSwapPayload ||
    spRaw.OneInchSwapPayload
  ) {
    const o =
      spRaw.OneinchSwapPayload ??
      spRaw.oneinchSwapPayload ??
      spRaw.OneInchSwapPayload

    const res: KeysignPayload['swapPayload'] = {
      case: 'oneinchSwapPayload',
      value: {
        $typeName: 'vultisig.keysign.v1.OneInchSwapPayload',
        fromCoin: mapNestedCoin(o.from_coin ?? o.fromCoin),
        toCoin: mapNestedCoin(o.to_coin ?? o.toCoin),
        fromAmount: String(o.from_amount ?? o.fromAmount),
        toAmountDecimal: o.to_amount_decimal ?? o.toAmountDecimal,
        quote: o.quote
          ? {
              $typeName: '' as any,
              dstAmount: String(o.quote.dst_amount ?? o.quote.dstAmount),
              tx: o.quote.tx
                ? {
                    swapFee: String(o.quote.swap_fee ?? 0),
                    $typeName: '' as any,
                    data: o.quote.tx.data,
                    from: o.quote.tx.from,
                    // IMPORTANT: avoid BigInt(undefined) crash
                    gas:
                      o.quote.tx.gas !== undefined && o.quote.tx.gas !== null
                        ? BigInt(o.quote.tx.gas)
                        : 0n,
                    gasPrice:
                      bigishToString(
                        o.quote.tx.gas_price ?? o.quote.tx.gasPrice
                      ) ?? '',
                    to: o.quote.tx.to,
                    value: bigishToString(o.quote.tx.value) ?? '',
                  }
                : undefined,
            }
          : undefined,
      },
    }

    swapDebug('oneinch payload (pre-encode):\n' + json(res.value))
    return res
  }

  // ---------- THORChain ----------
  if (spRaw.ThorchainSwapPayload || spRaw.thorchainSwapPayload) {
    const t = spRaw.ThorchainSwapPayload ?? spRaw.thorchainSwapPayload

    const fromAddr = t.from_address ?? t.fromAddress ?? ''
    const vaultAddressIn = t.vault_address ?? t.vaultAddress ?? ''
    const feeIn = t.fee // iOS keeps "" in fixtures

    const res: KeysignPayload['swapPayload'] = {
      case: 'thorchainSwapPayload',
      value: {
        $typeName: 'vultisig.keysign.v1.THORChainSwapPayload',
        fromAddress: fromAddr,
        fromCoin: mapNestedCoin(t.from_coin ?? t.fromCoin),
        toCoin: mapNestedCoin(t.to_coin ?? t.toCoin),
        vaultAddress: vaultAddressIn,
        routerAddress: emptyToUndefined(t.router_address ?? t.routerAddress),
        fromAmount: String(t.from_amount ?? t.fromAmount),
        toAmountDecimal: t.to_amount_decimal ?? t.toAmountDecimal,
        toAmountLimit: String(t.to_amount_limit ?? t.toAmountLimit ?? ''),
        streamingInterval: String(
          t.streaming_interval ?? t.streamingInterval ?? ''
        ),
        streamingQuantity: String(
          t.streaming_quantity ?? t.streamingQuantity ?? ''
        ),
        isAffiliate: Boolean(t.is_affiliate ?? t.isAffiliate),
        fee: feeIn === undefined ? '' : String(feeIn),
        expirationTime: BigInt(t.expiration_time ?? t.expirationTime ?? 0),
      },
    }

    swapDebug('thorchain payload (pre-encode):\n' + json(res.value))
    return res
  }

  swapDebug('no known swap payload type matched')
  return undefined
}
