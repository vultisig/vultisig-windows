import { initializeMessenger } from '../../messengers/initializeMessenger'

const inpageMessenger = initializeMessenger({ connect: 'inpage' })
export const keepAliveHandler = () => {
  inpageMessenger.reply('ping', () => {
    return 'pong'
  })
}
