import { bigishToString, booleanOrUndefined, numberOrUndefined } from '../utils'

export const mapBlockchainSpecific = (bsRaw: any) => {
  if (!bsRaw) return undefined

  // EVM-family (EthereumSpecific)
  if (bsRaw.EthereumSpecific || bsRaw.ethereumSpecific) {
    const e = bsRaw.EthereumSpecific ?? bsRaw.ethereumSpecific
    return {
      ethereumSpecific: {
        maxFeePerGasWei: bigishToString(
          e.max_fee_per_gas_wei ?? e.maxFeePerGasWei
        ),
        priorityFee: bigishToString(e.priority_fee ?? e.priorityFee),
        nonce: BigInt(e.nonce),
        gasLimit: bigishToString(e.gas_limit ?? e.gasLimit),
      },
    }
  }

  // Cosmos-family chains (CosmosSpecific, Terra/TerraClassic/Kujira/ATOM share this)
  if (bsRaw.CosmosSpecific || bsRaw.cosmosSpecific) {
    const c = bsRaw.CosmosSpecific ?? bsRaw.cosmosSpecific
    const ibc = c.ibc_denom_trace ?? c.ibcDenomTrace
    return {
      cosmosSpecific: {
        accountNumber: numberOrUndefined(c.account_number ?? c.accountNumber),
        gas: numberOrUndefined(c.gas),
        sequence: numberOrUndefined(c.sequence),
        transactionType: numberOrUndefined(
          c.transaction_type ?? c.transactionType
        ),
        ibcDenomTrace: ibc
          ? {
              baseDenom: ibc.base_denom ?? ibc.baseDenom,
              path: ibc.path,
              height: ibc.height, // keep as string (fixtures use "block_height_epoch" format)
            }
          : undefined,
      },
    }
  }

  // Ripple/XRP
  if (bsRaw.RippleSpecific || bsRaw.rippleSpecific) {
    const r = bsRaw.RippleSpecific ?? bsRaw.rippleSpecific
    return {
      rippleSpecific: {
        sequence: numberOrUndefined(r.sequence),
        gas: numberOrUndefined(r.gas),
        lastLedgerSequence: numberOrUndefined(
          r.last_ledger_sequence ?? r.lastLedgerSequence
        ),
      },
    }
  }

  // Solana
  if (bsRaw.SolanaSpecific || bsRaw.solanaSpecific) {
    const s = bsRaw.SolanaSpecific ?? bsRaw.solanaSpecific
    return {
      solanaSpecific: {
        recentBlockHash: s.recent_block_hash ?? s.recentBlockHash,
        priorityFee: bigishToString(s.priority_fee ?? s.priorityFee),
        hasProgramId: booleanOrUndefined(s.has_program_id ?? s.hasProgramId),
      },
    }
  }

  // THORChain
  if (bsRaw.ThorchainSpecific || bsRaw.thorchainSpecific) {
    const t = bsRaw.ThorchainSpecific ?? bsRaw.thorchainSpecific
    return {
      thorchainSpecific: {
        accountNumber: numberOrUndefined(t.account_number ?? t.accountNumber),
        sequence: numberOrUndefined(t.sequence),
        fee: numberOrUndefined(t.fee),
        isDeposit: booleanOrUndefined(t.is_deposit ?? t.isDeposit),
        transactionType: numberOrUndefined(
          t.transaction_type ?? t.transactionType
        ),
      },
    }
  }

  // MayaChain
  if (bsRaw.MayaSpecific || bsRaw.mayaSpecific) {
    const m = bsRaw.MayaSpecific ?? bsRaw.mayaSpecific
    return {
      mayaSpecific: {
        accountNumber: numberOrUndefined(m.account_number ?? m.accountNumber),
        sequence: numberOrUndefined(m.sequence),
        isDeposit: booleanOrUndefined(m.is_deposit ?? m.isDeposit),
      },
    }
  }

  // TON
  if (bsRaw.TonSpecific || bsRaw.tonSpecific) {
    const t = bsRaw.TonSpecific ?? bsRaw.tonSpecific
    return {
      tonSpecific: {
        sendMaxAmount: booleanOrUndefined(t.send_max_amount ?? t.sendMaxAmount),
        sequenceNumber: numberOrUndefined(
          t.sequence_number ?? t.sequenceNumber
        ),
        expireAt: numberOrUndefined(t.expire_at ?? t.expireAt),
        bounceable: booleanOrUndefined(t.bounceable),
      },
    }
  }

  // UTXO
  if (bsRaw.UtxoSpecific || bsRaw.utxoSpecific) {
    const u = bsRaw.UtxoSpecific ?? bsRaw.utxoSpecific
    return {
      utxoSpecific: {
        byteFee: bigishToString(u.byte_fee ?? u.byteFee),
        sendMaxAmount: booleanOrUndefined(u.send_max_amount ?? u.sendMaxAmount),
      },
    }
  }

  return bsRaw
}
