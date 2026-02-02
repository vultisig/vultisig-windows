const trc20TransferSelector = 'a9059cbb'

type Trc20TransferInfo = {
  recipient: string // hex address with 41 prefix
  amount: bigint
}

export const decodeTrc20TransferData = (
  data: string
): Trc20TransferInfo | null => {
  const cleanData = data.startsWith('0x') ? data.slice(2) : data

  if (!cleanData.startsWith(trc20TransferSelector)) {
    return null
  }

  try {
    // Extract recipient address (last 20 bytes of the first 32-byte parameter)
    // The parameter is 64 characters in hex
    const recipientPart = cleanData.slice(8, 72)
    // TRON addresses in hex usually have a 41 prefix (21 bytes total)
    // The padded address in ERC20 transfer is 32 bytes, where the last 20 bytes are the address.
    // We add the '41' prefix to make it a valid TRON hex address.
    const recipient = '41' + recipientPart.slice(-40)

    // Extract amount (second 32-byte parameter)
    const amountPart = cleanData.slice(72, 136)
    const amount = BigInt('0x' + amountPart)

    return {
      recipient,
      amount,
    }
  } catch (error) {
    console.error('Error decoding TRC20 transfer data:', error)
    return null
  }
}
