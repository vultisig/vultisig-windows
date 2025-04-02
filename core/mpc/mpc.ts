import { EventsEmit } from '@wailsapp/runtime'

import { DKLS } from './dkls/dkls'
import { KeygenType } from './keygen/KeygenType'
import { setKeygenComplete, waitForKeygenComplete } from './keygenComplete'
import { Schnorr } from './schnorr/schnorrKeygen'
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
    const dklsResult = await dklsKeygen.startKeygenWithRetry()

    EventsEmit('eddsa')
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

    await setKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      localPartyId: this.localPartyId,
    })

    await waitForKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      peers: this.keygenCommittee,
    })

    return {
      dkls: dklsResult,
      schnorr: schnorrResult,
    }
  }
  // startMigrate - start GG20->DKLS Migrate process
  public async startMigrate(
    publicKeyEcdsa: string,
    publickeyEdDSA: string,
    localUIEcdsa: string,
    localUIEddsa: string,
    hexChainCode: string
  ) {
    const dklsKeygen = new DKLS(
      this.tssType,
      this.isInitiateDevice,
      this.serverURL,
      this.sessionId,
      this.localPartyId,
      this.keygenCommittee,
      this.oldKeygenCommittee,
      this.hexEncryptionKey,
      localUIEcdsa,
      publicKeyEcdsa,
      hexChainCode
    )
    const dklsResult = await dklsKeygen.startKeygenWithRetry()

    EventsEmit('eddsa')
    const schnorrKeygen = new Schnorr(
      this.tssType,
      this.isInitiateDevice,
      this.serverURL,
      this.sessionId,
      this.localPartyId,
      this.keygenCommittee,
      this.oldKeygenCommittee,
      this.hexEncryptionKey,
      dklsKeygen.getSetupMessage(),
      localUIEddsa,
      publickeyEdDSA,
      hexChainCode
    )
    const schnorrResult = await schnorrKeygen.startKeygenWithRetry()

    await setKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      localPartyId: this.localPartyId,
    })
    await waitForKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      peers: this.keygenCommittee,
    })

    return {
      dkls: dklsResult,
      schnorr: schnorrResult,
    }
  }

  // startReshare - start Reshare process
  public async startReshare(
    ecdsaKeyshare: string | undefined,
    eddsaKeyshare: string | undefined
  ) {
    const oldCommittee = this.oldKeygenCommittee.filter(party =>
      this.keygenCommittee.includes(party)
    )
    const dklsKeygen = new DKLS(
      this.tssType,
      this.isInitiateDevice,
      this.serverURL,
      this.sessionId,
      this.localPartyId,
      this.keygenCommittee,
      oldCommittee,
      this.hexEncryptionKey
    )
    const dklsResult = await dklsKeygen.startReshareWithRetry(ecdsaKeyshare)

    EventsEmit('eddsa')
    const schnorrKeygen = new Schnorr(
      this.tssType,
      this.isInitiateDevice,
      this.serverURL,
      this.sessionId,
      this.localPartyId,
      this.keygenCommittee,
      oldCommittee,
      this.hexEncryptionKey,
      new Uint8Array(0)
    )
    const schnorrResult =
      await schnorrKeygen.startReshareWithRetry(eddsaKeyshare)

    await setKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      localPartyId: this.localPartyId,
    })
    await waitForKeygenComplete({
      serverURL: this.serverURL,
      sessionId: this.sessionId,
      peers: this.keygenCommittee,
    })

    return {
      dkls: dklsResult,
      schnorr: schnorrResult,
    }
  }
}
