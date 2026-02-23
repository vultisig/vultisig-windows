import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

type ChatAuthToken = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const getStorageKey = (publicKey: string) => `chatAuth_${publicKey}`

export const getChatAuthToken = (publicKey: string) =>
  getStorageValue<ChatAuthToken | null>(getStorageKey(publicKey), null)

export const setChatAuthToken = (publicKey: string, token: ChatAuthToken) =>
  setStorageValue(getStorageKey(publicKey), token)
