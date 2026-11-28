import { OtherChain } from '@vultisig/core-chain/Chain'

import { SubstrateChain } from './PolkadotSignerPayload'

/**
 * Each Substrate chain's genesis block hash, which a dApp signer payload
 * commits to via `CheckGenesis`. Polkadot and Bittensor sign with the same
 * ed25519 key, so this is what tells their payloads apart.
 */
export const substrateGenesisHash: Record<SubstrateChain, string> = {
  [OtherChain.Bittensor]:
    '0x2f0555cc76fc2840a25a6ea3b9637146806f1f44b090c175ffde2a7e5ab36c03',
  [OtherChain.Polkadot]:
    '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
}
