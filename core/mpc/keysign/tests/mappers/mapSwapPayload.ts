import { mapNestedCoin } from './mapNestedCoin'
import { bigishToString, booleanOrUndefined, numberOrUndefined } from '../utils'

export const mapSwapPayload = (spRaw: any) => {
  if (!spRaw) return null

  // OneInch / Lifiswap (EVM & Solana)
  if (
    spRaw.OneinchSwapPayload ||
    spRaw.oneinchSwapPayload ||
    spRaw.OneInchSwapPayload
  ) {
    const o =
      spRaw.OneinchSwapPayload ??
      spRaw.oneinchSwapPayload ??
      spRaw.OneInchSwapPayload

    return {
      oneinchSwapPayload: {
        fromCoin: mapNestedCoin(o.from_coin ?? o.fromCoin),
        toCoin: mapNestedCoin(o.to_coin ?? o.toCoin),
        fromAmount: bigishToString(o.from_amount ?? o.fromAmount),
        toAmountDecimal: o.to_amount_decimal ?? o.toAmountDecimal,
        toAmountLimit: bigishToString(o.to_amount_limit ?? o.toAmountLimit),
        quote: o.quote
          ? {
              dstAmount: bigishToString(
                o.quote.dst_amount ?? o.quote.dstAmount
              ),
              tx: o.quote.tx
                ? {
                    data: o.quote.tx.data,
                    from: o.quote.tx.from,
                    gas: numberOrUndefined(o.quote.tx.gas),
                    gasPrice: bigishToString(
                      o.quote.tx.gas_price ?? o.quote.tx.gasPrice
                    ),
                    to: o.quote.tx.to,
                    value: bigishToString(o.quote.tx.value),
                  }
                : undefined,
            }
          : undefined,
      },
    }
  }

  // THORChain swap
  if (spRaw.ThorchainSwapPayload || spRaw.thorchainSwapPayload) {
    const t = spRaw.ThorchainSwapPayload ?? spRaw.thorchainSwapPayload
    return {
      thorchainSwapPayload: {
        fromAddress: t.from_address ?? t.fromAddress,
        fromCoin: mapNestedCoin(t.from_coin ?? t.fromCoin),
        toCoin: mapNestedCoin(t.to_coin ?? t.toCoin),
        vaultAddress: t.vault_address ?? t.vaultAddress,
        fromAmount: bigishToString(t.from_amount ?? t.fromAmount),
        toAmountDecimal: t.to_amount_decimal ?? t.toAmountDecimal,
        toAmountLimit: bigishToString(t.to_amount_limit ?? t.toAmountLimit),
        streamingInterval: bigishToString(
          t.streaming_interval ?? t.streamingInterval
        ),
        streamingQuantity: bigishToString(
          t.streaming_quantity ?? t.streamingQuantity
        ),
        isAffiliate: booleanOrUndefined(t.is_affiliate ?? t.isAffiliate),
        fee: bigishToString(t.fee),
        expirationTime: numberOrUndefined(
          t.expiration_time ?? t.expirationTime
        ),
      },
    }
  }

  // MayaChain swap
  if (spRaw.MayachainSwapPayload || spRaw.mayachainSwapPayload) {
    const m = spRaw.MayachainSwapPayload ?? spRaw.mayachainSwapPayload
    return {
      mayachainSwapPayload: {
        fromAddress: m.from_address ?? m.fromAddress,
        fromCoin: mapNestedCoin(m.from_coin ?? m.fromCoin),
        toCoin: mapNestedCoin(m.to_coin ?? m.toCoin),
        vaultAddress: m.vault_address ?? m.vaultAddress,
        fromAmount: bigishToString(m.from_amount ?? m.fromAmount),
        toAmountDecimal: m.to_amount_decimal ?? m.toAmountDecimal,
        toAmountLimit: bigishToString(m.to_amount_limit ?? m.toAmountLimit),
        streamingInterval: bigishToString(
          m.streaming_interval ?? m.streamingInterval
        ),
        streamingQuantity: bigishToString(
          m.streaming_quantity ?? m.streamingQuantity
        ),
        isAffiliate: booleanOrUndefined(m.is_affiliate ?? m.isAffiliate),
        fee: bigishToString(m.fee),
        expirationTime: numberOrUndefined(
          m.expiration_time ?? m.expirationTime
        ),
      },
    }
  }

  // Kyber
  if (spRaw.KyberSwapPayload || spRaw.kyberSwapPayload) {
    const k = spRaw.KyberSwapPayload ?? spRaw.kyberSwapPayload
    return {
      kyberSwapPayload: {
        fromCoin: mapNestedCoin(k.from_coin ?? k.fromCoin),
        toCoin: mapNestedCoin(k.to_coin ?? k.toCoin),
        fromAmount: bigishToString(k.from_amount ?? k.fromAmount),
        toAmountDecimal: k.to_amount_decimal ?? k.toAmountDecimal,
        toAmountLimit: bigishToString(k.to_amount_limit ?? k.toAmountLimit),
        quote: k.quote
          ? {
              dstAmount: bigishToString(
                k.quote.dst_amount ?? k.quote.dstAmount
              ),
              tx: k.quote.tx
                ? {
                    data: k.quote.tx.data,
                    from: k.quote.tx.from,
                    gas: numberOrUndefined(k.quote.tx.gas),
                    gasPrice: bigishToString(
                      k.quote.tx.gas_price ?? k.quote.tx.gasPrice
                    ),
                    to: k.quote.tx.to,
                    value: bigishToString(k.quote.tx.value),
                  }
                : undefined,
            }
          : undefined,
      },
    }
  }

  return spRaw
}
