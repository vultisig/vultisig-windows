import { toDisplayMessageString } from '@core/inpage-provider/popup/view/utils/toDisplayMessage'
import { TonSignDataPayload } from '@core/ui/mpc/keysign/customMessage/ton/tonSignData'

/**
 * What the popup shows for a TON Connect `signData` request: the text as is,
 * binary data decoded when it is readable, and a cell with its TL-B schema.
 */
export const getTonSignDataDisplayMessage = (
  payload: TonSignDataPayload
): string => {
  switch (payload.type) {
    case 'text':
      return payload.text
    case 'binary':
      return toDisplayMessageString(Buffer.from(payload.bytes, 'base64'))
    case 'cell':
      return JSON.stringify({ schema: payload.schema, cell: payload.cell })
  }
}
