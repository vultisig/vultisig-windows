import { StdTx } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'

type CosmosSerializedData = {
  tx_bytes: string
}

type CosmosAminoJson = {
  mode: string
  tx: StdTx
}

export const parseCosmosSerialized = (
  serialized: string | CosmosSerializedData | undefined
): CosmosSerializedData => {
  if (!serialized) {
    throw new Error('Serialized Cosmos transaction data is missing')
  }

  if (
    typeof serialized === 'object' &&
    serialized !== null &&
    'tx_bytes' in serialized
  ) {
    const result = serialized as CosmosSerializedData

    if (!result.tx_bytes) {
      throw new Error('tx_bytes field is missing or empty in serialized data')
    }
    return result
  }

  if (typeof serialized !== 'string') {
    throw new Error(
      `Invalid serialized format: expected string or object with tx_bytes, got ${typeof serialized}`
    )
  }

  if (serialized.trim() === '') {
    throw new Error('Serialized Cosmos transaction data is empty')
  }

  try {
    const parsed = JSON.parse(serialized)

    if ('tx_bytes' in parsed && parsed.tx_bytes) {
      return parsed as CosmosSerializedData
    }

    if ('tx' in parsed && parsed.tx) {
      const aminoJson = parsed as CosmosAminoJson

      const stdTx = aminoJson.tx
      if (!stdTx.signatures || stdTx.signatures.length === 0) {
        throw new Error('Amino JSON transaction missing signatures')
      }

      try {
        const aminoJsonString = JSON.stringify(stdTx)
        const aminoBytes = new TextEncoder().encode(aminoJsonString)
        const txBytesBase64 = toBase64(aminoBytes)

        return { tx_bytes: txBytesBase64 }
      } catch (error) {
        throw new Error(
          `Failed to encode Amino JSON transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    throw new Error(
      'Parsed JSON does not contain tx_bytes (protobuf) or tx (Amino JSON) field'
    )
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('tx_bytes') || error.message.includes('tx'))
    ) {
      throw error
    }
    throw new Error(
      `Failed to parse serialized Cosmos transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
