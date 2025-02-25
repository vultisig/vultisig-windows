import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { match } from '@lib/utils/match'
import { EventsEmit } from '@wailsapp/runtime'

import { DKLSKeysign } from './dkls/dklsKeysign'
import { SchnorrKeysign } from './schnorr/schnorrKeysign'
/**
 * MPCKeysign class - this class handle keysign using DKLS/Schnorr library
 * NOTE: this class doesn't handle GG20 keysign, for desktop GG20 is handled by the method defined in golang
 * for react-native , GG20 will be handled by the method defined in the native modules
 */
export class MPCKeysign {
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keysignCommittee: string[]
  private readonly hexEncryptionKey: string
  constructor(
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keysignCommittee: string[],
    hexEncryptionKey: string
  ) {
    this.isInitiateDevice = isInitiateDevice
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.keysignCommittee = keysignCommittee
    this.hexEncryptionKey = hexEncryptionKey
  }

  public async startKeysign(
    keyshare: string,
    algo: SignatureAlgorithm,
    messagesToSign: string[],
    publicKey: string,
    chainPath: string
  ) {
    const result = await match(algo, {
      ecdsa: async () => {
        EventsEmit('PrepareVault')
        const dklsKeysign = new DKLSKeysign(
          this.serverURL,
          this.localPartyId,
          this.sessionId,
          this.hexEncryptionKey,
          publicKey,
          chainPath,
          this.keysignCommittee,
          this.isInitiateDevice,
          keyshare
        )
        EventsEmit('ECDSA')
        return await dklsKeysign.startKeysign(messagesToSign)
      },
      eddsa: async () => {
        const schnorrKeysign = new SchnorrKeysign(
          this.serverURL,
          this.localPartyId,
          this.sessionId,
          this.hexEncryptionKey,
          publicKey,
          'm', // chainPath is only used for ECDSA right now , pass 'm' as a dummy value
          this.keysignCommittee,
          this.isInitiateDevice,
          keyshare
        )
        EventsEmit('EDDSA')
        return await schnorrKeysign.startKeysign(messagesToSign)
      },
    })
    return result
  }
}
