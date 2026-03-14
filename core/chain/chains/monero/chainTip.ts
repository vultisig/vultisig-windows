import { getMoneroDaemonUrls } from './daemonRpc'

export const getMoneroChainTip = async (): Promise<number> => {
  let lastError: unknown = null

  for (const daemonUrl of getMoneroDaemonUrls()) {
    try {
      const response = await fetch(`${daemonUrl}/json_rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '0',
          method: 'get_info',
        }),
      })

      if (!response.ok) {
        throw new Error(`Monero daemon get_info failed with ${response.status}`)
      }

      const data = await response.json()
      const height = data?.result?.height
      if (typeof height !== 'number') {
        throw new Error('Monero daemon get_info returned no height')
      }

      return height
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to fetch Monero chain tip')
}
