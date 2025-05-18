import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'

export const messengers = {
  background: initializeMessenger({ connect: 'background' }),
  contentScript: initializeMessenger({ connect: 'contentScript' }),
  popup: initializeMessenger({ connect: 'popup' }),
}
