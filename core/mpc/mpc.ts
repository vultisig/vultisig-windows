import { EventsEmit } from '@wailsapp/runtime'

import { DKLS } from './dkls/dkls'
import { setKeygenComplete, waitForKeygenComplete } from './keygenComplete'
import { Schnorr } from './schnorr/schnorrKeygen'
import { KeygenType } from './tssType'
/**
 * MPC class - this class handle keygen/reshare using DKLS/Schnorr library
 * NOTE: this class doesn't handle GG20 keygen/keysign/reshare, GG20 is handled by the method defined in golang
 * for react-native , GG20 will be handled by the method defined in the native modules
 */
export class MPC {
  private readonly tssType: KeygenType
  private readonly isInitiateDevice: boolean
  private readonly serverURL: string
  private readonly sessionId: string
  private readonly localPartyId: string
  private readonly keygenCommittee: string[]
  private readonly oldKeygenCommittee: string[]
  private readonly hexEncryptionKey: string
  constructor(
    tssType: KeygenType,
    isInitiateDevice: boolean,
    serverURL: string,
    sessionId: string,
    localPartyId: string,
    keygenCommittee: string[],
    oldKeygenCommittee: string[],
    hexEncryptionKey: string
  ) {
    this.tssType = tssType
    this.isInitiateDevice = isInitiateDevice
    this.serverURL = serverURL
    this.sessionId = sessionId
    this.localPartyId = localPartyId
    this.keygenCommittee = keygenCommittee
    this.oldKeygenCommittee = oldKeygenCommittee
    this.hexEncryptionKey = hexEncryptionKey
  }
  // startKeygen - start keygen process
  public async startKeygen() {
    EventsEmit('PrepareVault') // TODO: when doing in react-native , we need to find new way to emit the events
    const dklsKeygen = new DKLS(
      this.tssType,
      this.isInitiateDevice,
      this.serverURL,
      this.sessionId,
      this.localPartyId,
      this.keygenCommittee,
      this.oldKeygenCommittee,
      this.hexEncryptionKey
    )
    EventsEmit('ECDSA')
    const dklsResult = await dklsKeygen.startKeygenWithRetry()
    if (dklsResult === undefined) {
      throw new Error('DKLS keygen failed')
    }
    EventsEmit('EdDSA')
    const schnorrKeygen = new Schnorr(
      this.tssType,
      this.isInitiateDevice,
      this.serverURL,
      this.sessionId,
      this.localPartyId,
      this.keygenCommittee,
      this.oldKeygenCommittee,
      this.hexEncryptionKey,
      dklsKeygen.getSetupMessage()
    )
    const schnorrResult = await schnorrKeygen.startKeygenWithRetry()
    if (schnorrResult === undefined) {
      throw new Error('Schnorr keygen failed')
    }
    await setKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      localPartyId: this.localPartyId,
    })
    const isCompleteSuccessful = await waitForKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      peers: this.keygenCommittee,
    })
    if (!isCompleteSuccessful) {
      throw new Error('not all peers complete keygen successfully')
    }
    return {
      dkls: dklsResult,
      schnorr: schnorrResult,
    }
  }
}
