export class KeysignSignature {
  msg: string
  r: string
  s: string
  der_signature: string
  recovery_id: string
  static createFrom(source: any = {}) {
    return new KeysignSignature(source)
  }
  constructor(source: any = {}) {
    if ('string' === typeof source) source = JSON.parse(source)
    this.msg = source['msg']
    this.r = source['r']
    this.s = source['s']
    this.der_signature = source['der_signature']
    this.recovery_id = source['recovery_id']
  }
}
