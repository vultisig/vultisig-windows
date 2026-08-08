import { create } from '@bufbuild/protobuf'
import { buildQBTCDirectPayload } from '@core/ui/qbtc/dapp/buildQBTCDirectPayload'
import {
  qbtcChainId,
  qbtcDefaultFeeAmount,
  qbtcFeeDenom,
} from '@core/ui/qbtc/dapp/qbtcDirectConstants'
import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { QbtcVoteSelection } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignDirectSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { buildQbtcVoteMessages } from './buildVoteMessages'

// A QBTC gov vote is a single message, but its ML-DSA signature (~2.4 KB) makes
// the tx far heavier than a secp256k1 one. QBTC has a flat `min_tx_fee` and no
// minimum gas price (block `max_gas = -1`), so the generous limit is free —
// mirror the staking base limit to stay clear of the Terra-family floor.
const qbtcGovernanceGasLimit = 800_000n

type BuildQbtcVoteKeysignPayloadInput = {
  vault: Vault
  /** The vault's QBTC bech32 address (voter). */
  voterAddress: string
  proposalId: string
  selection: QbtcVoteSelection
  walletCore: WalletCore
}

/**
 * Builds the `KeysignMessagePayload` for a QBTC governance vote. The vote
 * message is encoded into `signData.signDirect` body/auth bytes exactly like
 * QBTC staking, so the shared ML-DSA keysign + Cosmos-REST broadcast pipeline
 * signs and submits it without any vote-specific handling.
 */
export const buildQbtcVoteKeysignPayload = async ({
  vault,
  voterAddress,
  proposalId,
  selection,
  walletCore,
}: BuildQbtcVoteKeysignPayloadInput): Promise<KeysignMessagePayload> => {
  const hexPublicKey = shouldBePresent(
    vault.publicKeyMldsa,
    'vault.publicKeyMldsa'
  )
  const feeCoin = chainFeeCoin[Chain.QBTC]

  const basePayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      chain: Chain.QBTC,
      ticker: feeCoin.ticker,
      logo: feeCoin.logo,
      decimals: feeCoin.decimals,
      priceProviderId: feeCoin.priceProviderId,
      address: voterAddress,
      hexPublicKey,
    }),
    memo: '',
    toAddress: '',
    toAmount: '0',
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: getVaultId(vault),
    libType: toKeysignLibType(vault),
  })

  const blockchainSpecific = await getChainSpecific({
    keysignPayload: basePayload,
    walletCore,
    isDeposit: true,
  })
  if (blockchainSpecific.case !== 'cosmosSpecific') {
    throw new Error(
      `QBTC vote requires cosmosSpecific chain data, got ${blockchainSpecific.case}`
    )
  }
  const { sequence, accountNumber } = blockchainSpecific.value

  const messages = buildQbtcVoteMessages({
    proposalId,
    voter: voterAddress,
    selection,
  })

  const { bodyBytes, authInfoBytes } = buildQBTCDirectPayload({
    messages,
    hexPublicKey,
    sequence,
    fee: {
      amount: [{ denom: qbtcFeeDenom, amount: qbtcDefaultFeeAmount }],
      gas: qbtcGovernanceGasLimit.toString(),
    },
  })

  return {
    keysign: create(KeysignPayloadSchema, {
      ...basePayload,
      blockchainSpecific,
      signData: {
        case: 'signDirect',
        value: create(SignDirectSchema, {
          chainId: qbtcChainId,
          bodyBytes,
          authInfoBytes,
          accountNumber: accountNumber.toString(),
        }),
      },
    }),
  }
}
