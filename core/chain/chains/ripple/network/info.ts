import { getRippleClient } from '../client'

export const getRippleNetworkInfo = async () => {
  const client = await getRippleClient()

  const { result } = await client.request({
    command: 'server_state',
  })

  return result.state
}
