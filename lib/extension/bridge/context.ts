/**
 * What the background knows about the page behind a bridge request, taken
 * from the message sender rather than from anything the page claims.
 * `requestWindowId` is the browser window of the sending tab, absent when the
 * request did not come from a tab.
 */
export type BridgeContext = {
  requestFavicon?: string
  requestName?: string
  requestOrigin: string
  requestWindowId?: number
}
