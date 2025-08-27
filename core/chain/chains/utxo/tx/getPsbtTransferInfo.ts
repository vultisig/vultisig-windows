import { address, networks, Psbt } from 'bitcoinjs-lib'

export const getPsbtTransferInfo = (psbt: Psbt, senderAddress: string) => {
  const network = networks.bitcoin

  const allOutputs = psbt.txOutputs.map(o => ({
    value: BigInt(o.value),
    addr: address.fromOutputScript(o.script, network),
  }))

  const recipients = allOutputs.filter(o => o.addr !== senderAddress)

  const outputsTotal = recipients.reduce((s, o) => s + o.value, 0n)

  return {
    sendAmount: outputsTotal,
    recipient: recipients.map(r => r.addr)[0],
  }
}
