import { WalletCore } from '@trustwallet/wallet-core';

import { tss } from '../../../wailsjs/go/models';

class SignatureProvider {
  private walletCore: WalletCore;
  private signatures: { [key: string]: tss.KeysignResponse };
  constructor(
    walletCore: WalletCore,
    signatures: { [key: string]: tss.KeysignResponse }
  ) {
    this.walletCore = walletCore;
    this.signatures = signatures;
    this.walletCore = walletCore;
  }

  getDerSignature(preHash: Uint8Array): Uint8Array {
    const preHashHex = this.walletCore.HexCoding.encode(preHash);
    if (this.signatures[preHashHex]) {
      const sigResult = this.signatures[preHashHex];
      return this.walletCore.HexCoding.decode(sigResult.der_signature);
    }
    return Uint8Array.from([]); // empty array
  }

  getSignatureWithRecoveryId(preHash: Uint8Array): Uint8Array {
    const preHashHex = this.walletCore.HexCoding.encode(preHash);
    if (this.signatures[preHashHex]) {
      const sigResult = this.signatures[preHashHex];
      const rData = this.walletCore.HexCoding.decode(sigResult.r);
      const sData = this.walletCore.HexCoding.decode(sigResult.s);
      const recoveryIDdata = this.walletCore.HexCoding.decode(
        sigResult.recovery_id
      );

      const combinedData = new Uint8Array(
        rData.length + sData.length + recoveryIDdata.length
      );
      combinedData.set(rData);
      combinedData.set(sData, rData.length);
      combinedData.set(recoveryIDdata, rData.length + sData.length);
      return combinedData;
    }
    return Uint8Array.from([]); // empty array
  }

  // keep in mind EdDSA signature from TSS is in little endian format , need to convert it to bigendian
  getSignature(preHash: Uint8Array): Uint8Array {
    const preHashHex = this.walletCore.HexCoding.encode(preHash);
    if (this.signatures[preHashHex]) {
      const sigResult = this.signatures[preHashHex];
      const rData = this.walletCore.HexCoding.decode(sigResult.r).reverse();
      const sData = this.walletCore.HexCoding.decode(sigResult.s).reverse();

      const combinedData = new Uint8Array(rData.length + sData.length);
      combinedData.set(rData);
      combinedData.set(sData, rData.length);
      return combinedData;
    }
    return Uint8Array.from([]); // empty array
  }
}

export default SignatureProvider;
