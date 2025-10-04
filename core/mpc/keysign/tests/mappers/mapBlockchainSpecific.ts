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
        fromTokenAssociatedAddress: s.from_token_associated_address,
        toTokenAssociatedAddress: s.to_token_associated_address,
        hasProgramId: booleanOrUndefined(s.has_program_id ?? s.hasProgramId),
      },
    }
  }

  // THORChain
  if (bsRaw.ThorchainSpecific || bsRaw.thorchainSpecific) {
    const t = bsRaw.ThorchainSpecific ?? bsRaw.thorchainSpecific

    const hasIsDeposit =
      (t.is_deposit ?? t.isDeposit) !== undefined &&
      (t.is_deposit ?? t.isDeposit) !== null
    const isDepositVal = hasIsDeposit
      ? Boolean(t.is_deposit ?? t.isDeposit)
      : undefined

    const txTypeSrc = t.transaction_type ?? t.transactionType
    const hasTxType = txTypeSrc !== undefined && txTypeSrc !== null
    const txTypeVal = hasTxType ? Number(txTypeSrc) : undefined

    return {
      thorchainSpecific: {
        accountNumber: numberOrUndefined(t.account_number ?? t.accountNumber),
        sequence: numberOrUndefined(t.sequence),
        fee: numberOrUndefined(t.fee),
        isDeposit: isDepositVal,
        transactionType: txTypeVal,
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
  // TRON

  if (bsRaw.TronSpecific || bsRaw.tronSpecific) {
    const t = bsRaw.TronSpecific ?? bsRaw.tronSpecific
    return {
      tronSpecific: {
        timestamp: numberOrUndefined(t.timestamp),
        expiration: numberOrUndefined(t.expiration),
        blockHeaderTimestamp: numberOrUndefined(t.block_header_timestamp),
        blockHeaderNumber: numberOrUndefined(t.block_header_number),
        blockHeaderVersion: numberOrUndefined(t.block_header_version),
        blockHeaderTxTrieRoot: t.block_header_tx_trie_root,
        blockHeaderParentHash: t.block_header_parent_hash,
        blockHeaderWitnessAddress: t.block_header_witness_address,
        gasEstimation: t.gas_estimation,
      },
    }
  }

  // Polkadot
  if (bsRaw.PolkadotSpecific || bsRaw.polkadotSpecific) {
    const p = bsRaw.PolkadotSpecific ?? bsRaw.polkadotSpecific
    return {
      polkadotSpecific: {
        recentBlockHash: p.recent_block_hash,
        nonce: numberOrUndefined(p.nonce),
        currentBlockNumber: p.current_block_number,
        specVersion: numberOrUndefined(p.spec_version),
        transactionVersion: numberOrUndefined(p.transaction_version),
        genesisHash: p.genesis_hash,
      },
    }
  }

  // Sui
  if (bsRaw.SuicheSpecific || bsRaw.suicheSpecific) {
    const s = bsRaw.SuicheSpecific ?? bsRaw.suicheSpecific
    return {
      suicheSpecific: {
        referenceGasPrice: s.reference_gas_price,
        coins: s.coins.map((coin: any) => ({
          coinType: coin.coin_type,
          coinObjectId: coin.coin_object_id,
          version: coin.version,
          digest: coin.digest,
          balance: coin.balance,
          previousTransaction: coin.previous_transaction,
        })),
      },
    }
  }
  return bsRaw
}
