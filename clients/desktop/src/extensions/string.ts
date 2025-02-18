import { keccak256 } from 'js-sha3'

declare global {
  interface String {
    asUrl(): URL
    isNameService(): boolean
    namehash(): string
  }
}

String.prototype.asUrl = function (): URL {
  return new URL(this.toString())
}

String.prototype.isNameService = function (): boolean {
  return this.includes('.eth') || this.includes('.sol')
}

String.prototype.namehash = function (): string {
  // Split the ENS name into labels
  const labels = this.split('.').reverse()

  // Initialize the node as 32 bytes of zero data
  let node = new Uint8Array(32)

  for (const label of labels) {
    // Convert the label to a Uint8Array, hash it
    const labelData = new TextEncoder().encode(label)
    const labelHash = new Uint8Array(keccak256.arrayBuffer(labelData))

    // Combine the current node hash with the label hash and hash again
    const combined = new Uint8Array([...node, ...labelHash])
    node = new Uint8Array(keccak256.arrayBuffer(combined))
  }

  // Convert the final node to a hex string
  return (
    '0x' +
    Array.from(node)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  )
}

export {}
